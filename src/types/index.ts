export interface FileItem {
  name: string
  path: string
  type: 'file' | 'directory'
  extension?: string
  children?: FileItem[]
}

export interface Site {
  id: string
  name: string
  path: string
  icon?: string
  createdAt: number
  enableWatcher: boolean
}

export interface Theme {
  id: string
  name: string
  isDark: boolean
}

export interface EditorState {
  content: string
  filePath: string | null
  isDirty: boolean
}

declare global {
  interface Window {
    electronAPI: {
      selectDirectory: () => Promise<string | null>
      readDirectory: (dirPath: string) => Promise<FileItem[]>
      readFile: (filePath: string) => Promise<string | null>
      writeFile: (filePath: string, content: string) => Promise<boolean>
      createFile: (dirPath: string, fileName: string) => Promise<{ success: boolean; path?: string; error?: string }>
      createDirectory: (dirPath: string, dirName: string) => Promise<{ success: boolean; path?: string; error?: string }>
      deleteItem: (itemPath: string) => Promise<{ success: boolean; error?: string }>
      renameItem: (oldPath: string, newName: string) => Promise<{ success: boolean; newPath?: string; error?: string }>
      watchDirectory: (dirPath: string) => Promise<boolean>
      unwatchDirectory: (dirPath: string) => Promise<boolean>
      openExternal: (url: string) => Promise<void>
      getAppPath: () => Promise<string>
      pathExists: (path: string) => Promise<boolean>
      onDirectoryChanged: (callback: (data: { event: string; path: string }) => void) => void
      removeDirectoryChangedListener: () => void
    }
  }
}

export {}
