import { contextBridge, ipcRenderer } from 'electron'

// 存储回调引用以便精确移除
const listeners = new Map<string, (...args: any[]) => void>()

contextBridge.exposeInMainWorld('electronAPI', {
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  readDirectory: (dirPath: string) => ipcRenderer.invoke('read-directory', dirPath),
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
  getFileStats: (filePath: string) => ipcRenderer.invoke('get-file-stats', filePath),
  writeFile: (filePath: string, content: string) => ipcRenderer.invoke('write-file', filePath, content),
  createFile: (dirPath: string, fileName: string) => ipcRenderer.invoke('create-file', dirPath, fileName),
  createDirectory: (dirPath: string, dirName: string) => ipcRenderer.invoke('create-directory', dirPath, dirName),
  deleteItem: (itemPath: string) => ipcRenderer.invoke('delete-item', itemPath),
  renameItem: (oldPath: string, newName: string) => ipcRenderer.invoke('rename-item', oldPath, newName),
  watchDirectory: (dirPath: string) => ipcRenderer.invoke('watch-directory', dirPath),
  unwatchDirectory: (dirPath: string) => ipcRenderer.invoke('unwatch-directory', dirPath),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  pathExists: (path: string) => ipcRenderer.invoke('path-exists', path),
  onDirectoryChanged: (callback: (data: { event: string; path: string }) => void) => {
    // 移除旧监听器避免重复
    const oldCallback = listeners.get('directory-changed')
    if (oldCallback) {
      ipcRenderer.removeListener('directory-changed', oldCallback)
    }
    
    // 包装回调以存储引用
    const wrappedCallback = (_: any, data: { event: string; path: string }) => callback(data)
    listeners.set('directory-changed', wrappedCallback)
    ipcRenderer.on('directory-changed', wrappedCallback)
  },
  removeDirectoryChangedListener: () => {
    const wrappedCallback = listeners.get('directory-changed')
    if (wrappedCallback) {
      ipcRenderer.removeListener('directory-changed', wrappedCallback)
      listeners.delete('directory-changed')
    }
  },
  // 搜索相关 API
  searchQuery: (request) => ipcRenderer.invoke('search:query', request),
  searchCancel: () => ipcRenderer.send('search:cancel'),
  searchGetHistory: () => ipcRenderer.invoke('search:getHistory'),
  searchSaveToHistory: (item) => ipcRenderer.invoke('search:saveToHistory', item),
  onSearchProgress: (callback) => {
    const wrappedCallback = (_: any, progress: { searchedFiles: number; totalFiles: number }) => callback(progress)
    listeners.set('search:progress', wrappedCallback)
    ipcRenderer.on('search:progress', wrappedCallback)
    return () => {
      ipcRenderer.removeListener('search:progress', wrappedCallback)
      listeners.delete('search:progress')
    }
  },
  removeSearchProgressListener: () => {
    const wrappedCallback = listeners.get('search:progress')
    if (wrappedCallback) {
      ipcRenderer.removeListener('search:progress', wrappedCallback)
      listeners.delete('search:progress')
    }
  },
})
