/**
 * `sidebarFiles` namespace dictionaries, and the namespace's declaration.
 *
 * The failure lines name what the tree could not list, one code each, because a
 * directory that is gone, one outside the workspace, and a path that is not a
 * directory each suggest a different next step.
 *
 * The namespace merge lives with its key set so that any module naming
 * `TranslateNS<'sidebarFiles'>` or `PropsLocale<'sidebarFiles'>` needs only this
 * file, whichever entry a program loads first.
 */
import type {} from '@deepseek-ai/dsh-client-ui-slots'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** File-tree type name, guide entry, row states, and failure lines. */
    sidebarFiles: SidebarFilesKey
  }
}

/** Simplified Chinese dictionary and key-set source of truth. */
export const zh = {
  'type.label': '文件',
  'guide.title': '文件',
  'guide.description': '浏览这个会话工作区里的文件，点开就能查看。',
  loading: '正在读取…',
  empty: '空目录',
  truncated: '条目太多，只显示了一部分。',
  noWorkspace: '这个会话没有工作区目录。',
  reload: '重新读取',
  'entry.other': '这不是文件或目录，没法打开。',
  'error.notFound': '这个目录不在了。可能已被移动或删除。',
  'error.outsideWorkspace': '这个目录在工作区之外，侧栏不会读取它。',
  'error.notDirectory': '这不是一个目录。',
  'error.unavailable': '读取失败：{message}',
  'menu.newSessionHere': '在这里新建会话',
  'menu.newSessionEach': '在每个子文件夹里新建会话…',
  'bulk.title': '在每个子文件夹里新建会话',
  'bulk.description': '把这个目录下的每个子文件夹都注册成一个工作区，并在第一个里打开一个会话。',
  'bulk.group': '分组标签',
  'bulk.none': '这个目录没有子文件夹。',
  'bulk.all': '全选',
  'bulk.cancel': '取消',
  'bulk.close': '关闭',
  'bulk.open': '新建会话',
  'bulk.done': '已就绪 {count} 个工作区。',
} satisfies Record<string, string>

/** Files dictionary key union. */
export type SidebarFilesKey = keyof typeof zh

/** English dictionary, checked against the Chinese key set. */
export const en = {
  'type.label': 'Files',
  'guide.title': 'Files',
  'guide.description': 'Browse the files in this session\'s workspace and open any of them.',
  loading: 'Reading…',
  empty: 'Empty directory',
  truncated: 'Too many entries; showing only some of them.',
  noWorkspace: 'This session has no workspace directory.',
  reload: 'Reload',
  'entry.other': 'Not a file or a directory, so it cannot be opened.',
  'error.notFound': 'That directory is gone. It may have been moved or deleted.',
  'error.outsideWorkspace': 'That directory is outside the workspace, so the sidebar will not read it.',
  'error.notDirectory': 'That is not a directory.',
  'error.unavailable': 'Read failed: {message}',
  'menu.newSessionHere': 'New session here',
  'menu.newSessionEach': 'New session in each sub-folder…',
  'bulk.title': 'New session in each sub-folder',
  'bulk.description': 'Register every sub-folder of this directory as its own workspace, and open a session in the first one.',
  'bulk.group': 'Group label',
  'bulk.none': 'This directory has no sub-folders.',
  'bulk.all': 'Select all',
  'bulk.cancel': 'Cancel',
  'bulk.close': 'Close',
  'bulk.open': 'Open sessions',
  'bulk.done': '{count} workspaces ready.',
} satisfies Record<SidebarFilesKey, string>
