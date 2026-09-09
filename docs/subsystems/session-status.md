# Session Status

English | [中文](session-status.zh.md)

Durable declared session status owned by [`@deepseek-ai/dsh-session-status`](../../packages/session-status/session-status). A status names what a session is doing at a glance, independent of the model behind it: the operator or the agent appends a whole-value `session/status` event, the `sessionStatus` projection folds it, and a human prompt clears it. Package READMEs own the vocabulary, the fold rules, and the write routes; the generated [persistence catalog](../persistence-catalog.md) owns the complete event declaration.

Sources: [`packages/session-status/session-status/src/types.ts`](../../packages/session-status/session-status/src/types.ts), [`packages/session-status/session-status/src/index.ts`](../../packages/session-status/session-status/src/index.ts)

## Status vocabulary

The shipped glyph identifiers are stable wire values, never components: the client resolves an id through its own allowlist and falls back to a neutral glyph for an id it does not know. The tone is the colour urgency, matching the workspace row's phase-mark arrangement.

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

Generated from source by `scripts/gen-cordis-catalog.ts` (verified fresh by `pnpm run verify-cordis-catalog` in doc-sync; regenerate with `pnpm run gen-cordis-catalog`) — the language sides differ only in locale-specific paired document paths. Signature blocks use a `ts cordis-catalog` fence and keep the original source JSDoc; dispatch modes are defined in the [primer](../cordis-primer.md#dispatch-modes), and the framework-inherited `ctx` API lives in [cordis-api/inherited.md](../cordis-api/inherited.md).

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

Types: [Session](session.md)

Source: [`packages/session-status/session-status/src/index.ts`](../../packages/session-status/session-status/src/index.ts)
<!-- END GENERATED cordis-surface -->
