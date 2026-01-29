import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  readDirectory: (dirPath: string) => ipcRenderer.invoke('read-directory', dirPath),
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
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
    ipcRenderer.on('directory-changed', (_, data) => callback(data))
  },
  removeDirectoryChangedListener: () => {
    ipcRenderer.removeAllListeners('directory-changed')
  },
})
