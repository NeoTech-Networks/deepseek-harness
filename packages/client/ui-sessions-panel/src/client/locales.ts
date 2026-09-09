/**
 * `sessionsPanel` namespace dictionaries: the tab title, its guide entry, the
 * Active/All filter, empty states, and the relative-time buckets shared by the
 * rows (the same bucket words the workspace browser uses).
 */

/** Simplified Chinese dictionary and key-set source of truth. */
export const zh = {
  'tab.title': '会话',
  'guide.title': '会话',
  'guide.description': '查看所有工作区中的会话，进行中的排在最前。',
  'filter.active': '进行中',
  'filter.all': '全部',
  'empty.active': '暂无进行中的会话',
  'empty.none': '暂无会话',
  'session.new': '新会话',
  'aria.list': '会话',
  'time.now': '刚刚',
  'time.minutes': '{n}分钟',
  'time.hours': '{n}小时',
  'time.days': '{n}天',
  'time.months': '{n}个月',
  'time.years': '{n}年',
} satisfies Record<string, string>

/** Sessions-panel dictionary key union. */
export type SessionsPanelKey = keyof typeof zh

/** English dictionary, checked against the Chinese key set. */
export const en = {
  'tab.title': 'Sessions',
  'guide.title': 'Sessions',
  'guide.description': 'See every session across your workspaces, active ones first.',
  'filter.active': 'Active',
  'filter.all': 'All',
  'empty.active': 'No active sessions',
  'empty.none': 'No sessions yet',
  'session.new': 'New Session',
  'aria.list': 'Sessions',
  'time.now': 'now',
  'time.minutes': '{n}min',
  'time.hours': '{n}h',
  'time.days': '{n}d',
  'time.months': '{n}mo',
  'time.years': '{n}y',
} satisfies Record<SessionsPanelKey, string>
