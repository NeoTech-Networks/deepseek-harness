/**
 * `accountUsage` namespace dictionaries.
 *
 * The footer reading is deliberately two short groups rather than one
 * sentence: the strip it joins is already a pipe-separated list of groups, and
 * a locale that orders "week" before "5h" can reorder them without a template
 * that hard-codes the order.
 */

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'line.fiveHour': '5小时 {percent}%',
  'line.week': '每周 {percent}%',
  'line.aria': '账号用量：5小时 {fiveHour}，每周 {week}',
  'line.unknown': '未知',
  'panel.title': '账号用量上限',
  'panel.fiveHour': '5 小时窗口',
  'panel.week': '每周窗口',
  'panel.scoped': '{label}（每周）',
  'panel.resets': '{when} 重置',
  'panel.credits': '本月额外用量：{amount}',
  'panel.asOf': '数据截至 {time}',
  'panel.never': '尚未读取',
  'panel.stale': '登录令牌已过期，下次模型调用后自动刷新。',
  'panel.unauthorized': '账号拒绝了当前登录，请重新授权后查看用量。',
  'panel.error': '暂时无法读取账号用量，显示的是上一次的数据。',
} satisfies Record<string, string>

/** The accountUsage namespace key union. */
export type AccountUsageKey = keyof typeof zh

// The seat merge lives beside the dictionary rather than in the plugin body,
// so every consumer of a key (the component, its tests) sees the namespace
// without importing the plugin.
declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** The account-limits reading's copy (dock line + its panel). */
    accountUsage: AccountUsageKey
  }
}

/** English dictionary, checked complete against the zh key set. */
export const en = {
  'line.fiveHour': '5h {percent}%',
  'line.week': 'Week {percent}%',
  'line.aria': 'Account usage: 5-hour {fiveHour}, weekly {week}',
  'line.unknown': 'unknown',
  'panel.title': 'Account limits',
  'panel.fiveHour': '5-hour window',
  'panel.week': 'Weekly window',
  'panel.scoped': '{label}, weekly',
  'panel.resets': 'resets {when}',
  'panel.credits': 'Extra usage this month: {amount}',
  'panel.asOf': 'as of {time}',
  'panel.never': 'not read yet',
  'panel.stale': 'Sign-in has expired; it refreshes on the next model call.',
  'panel.unauthorized': 'The account refused this sign-in. Re-authorize to see usage.',
  'panel.error': 'Could not read account usage just now; showing the last figures.',
} satisfies Record<AccountUsageKey, string>
