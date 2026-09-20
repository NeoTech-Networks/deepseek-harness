// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import * as primitives from '@deepseek-ai/dsh-client-ui-primitives'
import {
  IconAlarmClockOutline16, IconApiOutline14, IconArchiveOutline20, IconFolderClose16,
  IconGoalOutline16, IconSendOutline16,
} from '@deepseek-ai/dsh-client-ui-primitives'

afterEach(cleanup)

// Icon components all share the IconProps signature; the barrel also exports
// non-icon atoms (different props shapes), so filter by prefix BEFORE typing.
const icons = Object.fromEntries(
  Object.entries(primitives).filter(([name]) => name.startsWith('Icon')),
) as Record<string, (p: primitives.IconProps) => React.JSX.Element>
const iconNames = Object.keys(icons)

describe('ic_ds_ icon set', () => {
  it('exports the full icon set (46 deepsuite + 21 figma extracts + eight product glyphs + eight session stage marks)', () => {
    expect(iconNames.length).toBe(83)
  })

  it.each(iconNames)('%s renders an svg with currentColor fills and no hardcoded palette', (name) => {
    const Icon = icons[name]!
    const { container } = render(<Icon />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    const markup = container.innerHTML
    expect(markup).not.toMatch(/#[0-9a-fA-F]{3,8}"/)
    expect(markup).toContain('currentColor')
  })

  it('size and className props land on the root svg', () => {
    const { container } = render(<IconSendOutline16 size={20} className="x" />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('width')).toBe('20')
    expect(svg.getAttribute('height')).toBe('20')
    expect(svg.classList.contains('x')).toBe(true)
  })

  it('each glyph defaults to its own drawn size, not one set-wide default', () => {
    const api = render(<IconApiOutline14 />)
    expect(api.container.querySelector('svg')!.getAttribute('width')).toBe('14')
    const folder = render(<IconFolderClose16 />)
    expect(folder.container.querySelector('svg')!.getAttribute('width')).toBe('16')
    const archive = render(<IconArchiveOutline20 />)
    expect(archive.container.querySelector('svg')!.getAttribute('width')).toBe('20')
    const alarm = render(<IconAlarmClockOutline16 />)
    expect(alarm.container.querySelector('svg')!.getAttribute('width')).toBe('16')
  })

  it('renders reusable goal glyphs without document-global ids', () => {
    const { container } = render(<><IconGoalOutline16 /><IconGoalOutline16 /></>)
    expect(container.querySelector('[id]')).toBeNull()
    expect(container.querySelector('[clip-path]')).toBeNull()
  })
})

/**
 * The session stage marks carry no inline animation: the row's stylesheet owns
 * the loops, keyed on these `data-part` names. That makes the plain render the
 * MOTION-OFF case, and the design's contract for it is that the resting frame is
 * the complete glyph, so every defining stroke must be present and visible.
 */
describe('session stage marks', () => {
  const stages = {
    IconStageWorkingOutline24: ['arc', 'arc-back', 'core'],
    IconStageWritingOutline24: ['nib', 'ink', 'ink2'],
    IconStageAwaitingInputOutline24: ['caret'],
    IconStageBlockedOutline24: ['glass', 'grain', 'detail'],
    IconStageFailedOutline24: ['cross', 'cross-a', 'cross-b'],
    IconStageSavedOutline24: ['card', 'check'],
    IconStagePlanReadyOutline24: ['check', 'check-2', 'check-3'],
    IconStageDeployingOutline24: ['arrow', 'sweep'],
  } as const

  it('ships eight stage marks on the 24px grid at the 14px row size', () => {
    expect(Object.keys(stages)).toHaveLength(8)
    const { container } = render(<primitives.IconStageWorkingOutline24 />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('width')).toBe('14')
    expect(svg.getAttribute('viewBox')).toBe('0 0 24 24')
    expect(svg.getAttribute('stroke')).toBe('currentColor')
    expect(svg.getAttribute('fill')).toBe('none')
    expect(svg.getAttribute('stroke-width')).toBe('2.2')
  })

  it.each(Object.entries(stages))('%s shows its complete resting frame', (name, parts) => {
    const Icon = icons[name]!
    const { container } = render(<Icon />)
    for (const part of parts) {
      expect(container.querySelector(`[data-part="${part}"]`)).not.toBeNull()
    }
    // Nothing is invisible before a loop starts, which is what makes motion-off
    // and prefers-reduced-motion safe: the keyframes were reworked so 0% is the
    // drawn mark, and the mark itself never depends on the animation.
    for (const el of container.querySelectorAll('[opacity]')) {
      expect(Number(el.getAttribute('opacity'))).toBeGreaterThan(0)
    }
  })
})

describe('FishLogo', () => {
  it('renders the fish path in currentColor at the native ratio', () => {
    const { container } = render(<primitives.FishLogo />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('width')).toBe('24')
    expect(Number(svg.getAttribute('height'))).toBeCloseTo(17.66, 1)
    expect(svg.getAttribute('viewBox')).toBe('0 0 23.16 17.04')
    expect(container.querySelectorAll('path')).toHaveLength(1)
    expect(container.innerHTML).toContain('currentColor')
    expect(container.innerHTML).not.toContain('M0 0L23.16')
  })
})

describe('BrandWordmark', () => {
  it('can render the name artwork with or without its leading mark', () => {
    const view = render(<primitives.BrandWordmark />)
    const svg = view.container.querySelector('svg')!
    expect(svg.getAttribute('width')).toBe('182')
    expect(svg.getAttribute('viewBox')).toBe('0 0 182 24')

    view.rerender(<primitives.BrandWordmark includeMark={false} />)
    expect(svg.getAttribute('width')).toBe('156')
    expect(svg.getAttribute('viewBox')).toBe('26 0 156 24')
  })
})
