/** Shared provider limits and Chat Files API defaults. */

/** Default maximum idle interval while an adapter stream read is outstanding. */
export const DEFAULT_STREAM_IDLE_TIMEOUT_MS = 300_000
/**
 * Default maximum wait for a stream's first content event.
 *
 * Grounded in measurement, not guessed. First-payload latency on
 * `deepseek-flash`, 2026-09-14: 797-1336 ms over six runs of a 156 KB request
 * carrying 112 tools, and 1526-2330 ms for contexts from 25k to 250k tokens on
 * requests up to 1.1 MB. The slowest honest first token was 2.33 s, so this
 * default carries roughly ten times that headroom.
 *
 * The failure it bounds looks nothing like slow: the route returns HTTP 200 and
 * then emits only keep-alive traffic until the provider's own cut-off, which
 * surfaces as the non-retryable `STREAM_CLOSED`. Expiry here is `TIMEOUT`
 * instead, which the default retry policy recovers, so an over-tight value
 * costs one retry rather than a turn.
 */
export const DEFAULT_STREAM_FIRST_PAYLOAD_TIMEOUT_MS = 25_000
/** Default combined request/response context capacity. */
export const DEFAULT_CONTEXT_WINDOW = 1_000_000
/** Default per-request output-token cap. */
export const DEFAULT_MAX_TOKENS = 256_000
/** Default bound on accumulated base64 image payload after Files API fallback. */
export const DEFAULT_MAX_INLINE_REQUEST_IMAGE_BYTES = 20 * 1024 * 1024
/** Deterministic raw-byte removal step. */
export const DEFAULT_IMAGE_OFFLOAD_BYTE_QUANTUM = 64 * 1024 * 1024
/** Deterministic base64-byte removal step after Files API fallback. */
export const DEFAULT_INLINE_IMAGE_OFFLOAD_BYTE_QUANTUM = 10 * 1024 * 1024
/** Deterministic image-count removal step. */
export const DEFAULT_IMAGE_OFFLOAD_COUNT_QUANTUM = 20
/** Default explicit lifetime for uploaded images. */
export const DEFAULT_FILE_EXPIRY_SECONDS = 7 * 24 * 60 * 60
/** Default proactive refresh window for indexed file ids. */
export const DEFAULT_FILE_REFRESH_MARGIN_SECONDS = 60 * 60
/** Default number of oldest harness-owned files removed on quota recovery. */
export const DEFAULT_FILE_QUOTA_CLEANUP_BATCH = 100
/** Default deadline for resolving one request image through the Files API. */
export const DEFAULT_FILES_API_TIMEOUT_MS = 60_000
