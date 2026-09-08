# Session Status

[English](session-status.md) | 中文

由 [`@deepseek-ai/dsh-session-status`](../../packages/session-status/session-status) 拥有的持久化已声明会话状态。状态一眼标出一个会话正在做什么，与其背后的模型无关：操作者或智能体追加整值 `session/status` 事件，`sessionStatus` 投影折叠它，人工提示清除它。包 README 拥有词表、折叠规则和写入路径；生成的 [persistence catalog](../persistence-catalog.zh.md) 拥有完整事件声明。

Sources: [`packages/session-status/session-status/src/types.ts`](../../packages/session-status/session-status/src/types.ts), [`packages/session-status/session-status/src/index.ts`](../../packages/session-status/session-status/src/index.ts)

## Status vocabulary

内置字形标识符是稳定的线上值，而非组件：客户端通过自己的允许列表解析 id，并对未知 id 回退到中性字形。色调是颜色紧急度，与工作区行的 phase-mark 布局一致。

```ts type-equiv
/**
 * The shipped glyph identifiers, drawn from the ui-primitives icon set. An id
 * is a stable wire value, never a component: the client resolves the id
 * through its own allowlist so a deployment that authors a new icon id keeps
 * working, and a client that does not know an id falls back to a neutral
 * generic glyph instead of throwing.
 */
type SessionStatusIconId =
  | 'right-up'
  | 'stop'
  | 'check'
  | 'clock'
  | 'pause'
```

```ts type-equiv
/**
 * Colour urgency of one status glyph. Identity lives in the glyph, urgency in
 * the colour, matching the workspace row's existing phase-mark arrangement.
 */
type SessionStatusTone = 'attention' | 'error' | 'success' | 'neutral'
```

```ts type-equiv
/**
 * One durable declared session status. The whole value travels in the
 * `session/status` event so a later vocabulary edit cannot retroactively
 * change or break a row already logged.
 */
interface SessionStatusValue {
  /** Stable kebab-case identity, resolved against the deployment vocabulary. */
  readonly id: string
  /** Human label shown in the row and hover card; operator-authored copy. */
  readonly label: string
  /** Glyph id the client resolves to a component. */
  readonly icon: SessionStatusIconId
  /** Colour urgency of the glyph. */
  readonly tone: SessionStatusTone
}
```

```ts type-equiv
/** One vocabulary entry the deployment declares; the folded value is the entry. */
interface SessionStatusVocabularyEntry extends SessionStatusValue {}
```

```ts type-equiv
/** Deployment-owned status vocabulary, validated at plugin load. */
interface SessionStatusConfig {
  /**
   * The allowed statuses. Ids must be non-empty and unique, every icon id must
   * be one of {@link SessionStatusIconId}, and every tone must be one of
   * {@link SessionStatusTone}; a malformed entry fails the plugin load loudly.
   */
  readonly vocabulary: readonly SessionStatusVocabularyEntry[]
}
```

<!-- BEGIN GENERATED cordis-surface (gen-cordis-catalog.ts) — do not edit between markers -->

<a id="cordis-surface"></a>

## Cordis API

Generated from source by `scripts/gen-cordis-catalog.ts` (verified fresh by `pnpm run verify-cordis-catalog` in doc-sync; regenerate with `pnpm run gen-cordis-catalog`) — the language sides differ only in locale-specific paired document paths. Signature blocks use a `ts cordis-catalog` fence and keep the original source JSDoc; dispatch modes are defined in the [primer](../cordis-primer.zh.md#dispatch-modes), and the framework-inherited `ctx` API lives in [cordis-api/inherited.md](../cordis-api/inherited.md).

<a id="ctxsessionstatus--sessionstatusservice"></a>

### `ctx.sessionStatus` — `SessionStatusService`

`ctx.sessionStatus`: owns the status vocabulary and the projection registration, and appends the whole-value `session/status` event on set and clear. Carriers serve the projection on the history tail page and the `session/projection` push frame, so a cold sidebar row reads it without the session being opened.

```ts cordis-catalog
/**
 * The deployment's current vocabulary, in declaration order.
 * @returns the vocabulary entries.
 */
list(): readonly SessionStatusValue[]

/**
 * Append the whole-value status for one vocabulary id, or throw when the id
 * is not in the vocabulary so an unknown id is a rendered error rather than
 * a silently dropped write.
 *
 * @param session - the owning session.
 * @param id - a vocabulary id.
 * @param note - optional operator or agent note recorded beside the status.
 */
set(session: Session, id: string, note?: string): void

/**
 * Clear the declared status.
 * @param session - the owning session.
 */
clear(session: Session): void

/**
 * The current declared status, or null while none is in force.
 * @param session - the owning session.
 * @returns the current declared status, or null.
 */
current(session: Session): SessionStatusValue | null
```

Types: [Session](session.zh.md)

Source: [`packages/session-status/session-status/src/index.ts`](../../packages/session-status/session-status/src/index.ts)
<!-- END GENERATED cordis-surface -->
