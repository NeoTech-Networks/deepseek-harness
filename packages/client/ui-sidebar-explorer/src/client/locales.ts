/**
 * The explorer's copy.
 *
 * Chinese is the key-set source of truth and English is checked against it, so
 * a key added on one side fails to compile on the other rather than silently
 * falling back to its identifier.
 */
import type {} from '@deepseek-ai/dsh-client-ui-slots'

/** Chinese dictionary; its keys are the namespace's key set. */
export const zh = {
  'type.label': '资源管理器',
  'text.label': '预览',
  'guide.title': '资源管理器',
  'guide.description': '浏览你固定的目录，无论当前会话在哪个工作区。',
  'roots.empty': '还没有固定任何目录。在下面添加一个。',
  'roots.add': '添加',
  'roots.browse': '浏览…',
  'roots.placeholder': '目录的完整路径',
  'roots.remove': '取消固定',
  'roots.unavailable': '当前无法访问',
  'level.empty': '空目录',
  'level.truncated': '条目过多，仅显示前一部分。',
  'action.reload': '刷新',
  'text.empty': '选择一个文件进行预览。',
  'text.loading': '正在读取…',
  'error.notFound': '路径不存在。',
  'error.notDirectory': '这不是一个目录。',
  'error.notAbsolute': '请输入完整路径。',
  'error.unreadable': '无法读取。',
  'error.notWritable': '设置文档不可写，无法保存。',
  'error.tooLarge': '文件过大，无法预览。',
  'error.notText': '这不是文本文件。',
  'error.unavailable': '读取失败：{message}',
} satisfies Record<string, string>

/** The namespace's key set, taken from the Chinese dictionary. */
export type SidebarExplorerKey = keyof typeof zh

/** English dictionary, checked against the Chinese key set. */
export const en = {
  'type.label': 'Explorer',
  'text.label': 'Preview',
  'guide.title': 'Explorer',
  'guide.description': 'Browse the folders you pinned, whatever workspace this session is in.',
  'roots.empty': 'No folders pinned yet. Add one below.',
  'roots.add': 'Add',
  'roots.browse': 'Browse...',
  'roots.placeholder': 'Full path to a folder',
  'roots.remove': 'Unpin',
  'roots.unavailable': 'not reachable right now',
  'level.empty': 'empty folder',
  'level.truncated': 'Too many entries; only the first are shown.',
  'action.reload': 'Refresh',
  'text.empty': 'Pick a file to preview it.',
  'text.loading': 'Reading...',
  'error.notFound': 'That path does not exist.',
  'error.notDirectory': 'That is not a folder.',
  'error.notAbsolute': 'Enter a full path.',
  'error.unreadable': 'Could not read that.',
  'error.notWritable': 'The settings document is not writable, so nothing was saved.',
  'error.tooLarge': 'That file is too big to preview.',
  'error.notText': 'That is not a text file.',
  'error.unavailable': 'Read failed: {message}',
} satisfies Record<SidebarExplorerKey, string>

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Explorer type name, guide entry, root management, row states, and failure lines. */
    sidebarExplorer: SidebarExplorerKey
  }
}
