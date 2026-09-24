/** Automatic image description: gate, route resolution, and describe call. */

import { describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import type { ImageAttachmentRef } from '@deepseek-ai/dsh-attachment'
import type { StreamChunk } from '@deepseek-ai/dsh-llm'
import VisionRouting, { VisionDescriptionError } from '../src/index.ts'

/** Minimal durable image reference for one describe call. */
function image(attachmentId: string): ImageAttachmentRef {
  return {
    attachmentId: attachmentId as ImageAttachmentRef['attachmentId'],
    mediaType: 'image/png',
    bytes: 3,
    width: 1,
    height: 1,
    name: 'pixel.png',
  }
}

/** One finite stream carrying a single text block and a `stop` finish. */
async function* textStream(text: string): AsyncIterable<StreamChunk> {
  yield { type: 'block-start', index: 0, blockType: 'text' }
  yield { type: 'text-delta', index: 0, text }
  yield { type: 'block-end', index: 0, block: { type: 'text', text } }
  yield { type: 'finish', reason: { kind: 'stop' } }
}

/** One stream that fails with an adapter error finish. */
async function* errorStream(): AsyncIterable<StreamChunk> {
  yield { type: 'finish', reason: { kind: 'error', failure: { message: 'provider refused', code: 'RATE_LIMITED' } } }
}

interface ModelInfo {
  inputModalities?: readonly string[]
}

/** Assemble a Context with mocked llm and preference, plus the plugin. */
async function boot(options: {
  models?: Record<string, ModelInfo>
  stream?: (provider: string, model: string) => AsyncIterable<StreamChunk>
  preference?: { enabled: boolean; allowedModels: readonly { provider: string; model: string }[] }
}): Promise<{ ctx: Context; resolveModelInfo: ReturnType<typeof vi.fn>; stream: ReturnType<typeof vi.fn> }> {
  const resolveModelInfo = vi.fn(async (provider: string, model: string): Promise<ModelInfo> => {
    const entry = options.models?.[`${provider}\0${model}`]
    if (entry !== undefined) return entry
    return { inputModalities: ['text', 'image'] }
  })
  const stream = vi.fn((request: { provider: string; model: string }) => {
    const factory = options.stream
    if (factory !== undefined) return factory(request.provider, request.model)
    return textStream('a red car')
  })
  const ctx = new Context()
  ctx.provide('llm', { resolveModelInfo, stream })
  ctx.provide('subagentModelSelection', {
    current: () => options.preference ?? { enabled: false, allowedModels: [] },
  })
  await ctx.plugin(VisionRouting)
  return { ctx, resolveModelInfo, stream }
}

describe('VisionRouting.enabled', () => {
  it('is off without the preference service', async () => {
    const ctx = new Context()
    ctx.provide('llm', { resolveModelInfo: vi.fn(), stream: vi.fn() })
    await ctx.plugin(VisionRouting)
    expect(ctx.visionRouting.enabled()).toBe(false)
  })

  it('is off when the preference is disabled', async () => {
    const { ctx } = await boot({ preference: { enabled: false, allowedModels: [{ provider: 'a', model: 'v' }] } })
    expect(ctx.visionRouting.enabled()).toBe(false)
  })

  it('is off when the preference names no routes', async () => {
    const { ctx } = await boot({ preference: { enabled: true, allowedModels: [] } })
    expect(ctx.visionRouting.enabled()).toBe(false)
  })

  it('is on when the preference is enabled with routes', async () => {
    const { ctx } = await boot({ preference: { enabled: true, allowedModels: [{ provider: 'a', model: 'v' }] } })
    expect(ctx.visionRouting.enabled()).toBe(true)
  })
})

describe('VisionRouting.describe', () => {
  it('returns empty text for an empty batch', async () => {
    const { ctx, stream } = await boot({})
    expect(await ctx.visionRouting.describe([])).toBe('')
    expect(stream).not.toHaveBeenCalled()
  })

  it('collects the vision model text', async () => {
    const { ctx, stream } = await boot({})
    const description = await ctx.visionRouting.describe([image('sha256:a1b2c3d4')])
    expect(description).toBe('a red car')
    expect(stream).toHaveBeenCalledOnce()
    const request = stream.mock.calls[0]?.[0] as { provider: string; model: string; messages: unknown[] }
    expect(request.provider).toBe('deepseek-official')
    expect(request.model).toBe('deepseek-flash')
  })

  it('prefers the first image-capable allowed route', async () => {
    const { ctx, stream } = await boot({
      models: { 'alpha\0text': { inputModalities: ['text'] }, 'alpha\0vision': { inputModalities: ['text', 'image'] } },
      preference: { enabled: true, allowedModels: [{ provider: 'alpha', model: 'text' }, { provider: 'alpha', model: 'vision' }] },
    })
    await ctx.visionRouting.describe([image('sha256:a1b2c3d4')])
    const request = stream.mock.calls[0]?.[0] as { provider: string; model: string }
    expect(request.provider).toBe('alpha')
    expect(request.model).toBe('vision')
  })

  it('falls back to the configured route when no allowed route sees images', async () => {
    const { ctx, stream } = await boot({
      models: { 'alpha\0text': { inputModalities: ['text'] } },
      preference: { enabled: true, allowedModels: [{ provider: 'alpha', model: 'text' }] },
    })
    await ctx.visionRouting.describe([image('sha256:a1b2c3d4')])
    const request = stream.mock.calls[0]?.[0] as { provider: string; model: string }
    expect(request.provider).toBe('deepseek-official')
    expect(request.model).toBe('deepseek-flash')
  })

  it('throws NO_IMAGE_CAPABLE_ROUTE when the fallback route cannot see images', async () => {
    const { ctx } = await boot({
      models: {
        'alpha\0text': { inputModalities: ['text'] },
        'deepseek-official\0deepseek-flash': { inputModalities: ['text'] },
      },
      preference: { enabled: true, allowedModels: [{ provider: 'alpha', model: 'text' }] },
    })
    await expect(ctx.visionRouting.describe([image('sha256:a1b2c3d4')]))
      .rejects.toMatchObject({ code: 'NO_IMAGE_CAPABLE_ROUTE' })
  })

  it('throws on an adapter error finish', async () => {
    const { ctx } = await boot({ stream: () => errorStream() })
    await expect(ctx.visionRouting.describe([image('sha256:a1b2c3d4')]))
      .rejects.toBeInstanceOf(VisionDescriptionError)
  })
})
