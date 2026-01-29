import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import { watch, FSWatcher } from 'chokidar'

let mainWindow: BrowserWindow | null = null
const watchers: Map<string, FSWatcher> = new Map()

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL('http://localhost:5180')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  watchers.forEach((watcher) => watcher.close())
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// IPC Handlers

// Select directory dialog
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory'],
  })
  return result.canceled ? null : result.filePaths[0]
})

// Read directory recursively
ipcMain.handle('read-directory', async (_, dirPath: string) => {
  const MAX_DEPTH = 10 // 限制递归深度防止无限递归
  
  const readDir = (currentPath: string, depth: number = 0): any[] => {
    if (depth > MAX_DEPTH) {
      return []
    }
    
    let items
    try {
      items = fs.readdirSync(currentPath, { withFileTypes: true })
    } catch (error) {
      console.error(`Error reading directory ${currentPath}:`, error)
      return []
    }
    
    return items
      .filter((item) => !item.name.startsWith('.'))
      .map((item) => {
        const fullPath = path.join(currentPath, item.name)
        
        // 检查实际文件状态（跟随符号链接）
        let stat
        try {
          stat = fs.statSync(fullPath)
        } catch (error) {
          // 符号链接指向的目标不存在或无法访问，跳过
          console.error(`Error stating ${fullPath}:`, error)
          return null
        }
        
        if (stat.isDirectory()) {
          return {
            name: item.name,
            path: fullPath,
            type: 'directory',
            children: readDir(fullPath, depth + 1),
          }
        }
        return {
          name: item.name,
          path: fullPath,
          type: 'file',
          extension: path.extname(item.name).toLowerCase(),
        }
      })
      .filter((item) => item !== null) // 过滤掉无法访问的项
      .sort((a, b) => {
        if (a.type === 'directory' && b.type === 'file') return -1
        if (a.type === 'file' && b.type === 'directory') return 1
        return a.name.localeCompare(b.name)
      })
  }

  try {
    return readDir(dirPath)
  } catch (error) {
    console.error('Error reading directory:', error)
    return []
  }
})

// Get file stats without reading content
ipcMain.handle('get-file-stats', async (_, filePath: string) => {
  try {
    const stat = fs.statSync(filePath)
    return {
      size: stat.size,
      isFile: stat.isFile(),
      isDirectory: stat.isDirectory(),
      mtime: stat.mtime,
      birthtime: stat.birthtime
    }
  } catch (error) {
    console.error('Error getting file stats:', error)
    return null
  }
})

// Read file content - 使用流式读取优化大文件性能
ipcMain.handle('read-file', async (_, filePath: string) => {
  try {
    // 先检查文件是否存在且可访问
    const stat = fs.statSync(filePath)
    
    // 如果不是普通文件（如目录、设备文件等），返回 null
    if (!stat.isFile()) {
      console.error(`Not a regular file: ${filePath}`)
      return null
    }
    
    // 限制文件大小，防止读取过大的文件导致内存问题 (10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024
    if (stat.size > MAX_FILE_SIZE) {
      console.error(`File too large: ${filePath} (${stat.size} bytes)`)
      // 对于超大文件，只读取前 1000 行
      return readFilePartial(filePath, 1000)
    }
    
    // 对于大文件 (> 500KB)，使用流式读取
    if (stat.size > 500 * 1024) {
      return readFileWithStream(filePath)
    }
    
    // 小文件使用同步读取
    const content = fs.readFileSync(filePath, 'utf-8')
    return content
  } catch (error) {
    console.error('Error reading file:', error)
    return null
  }
})

// 流式读取文件（避免阻塞）
async function readFileWithStream(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    const stream = fs.createReadStream(filePath, { encoding: 'utf-8' })
    
    stream.on('data', (chunk) => {
      chunks.push(Buffer.from(chunk))
    })
    
    stream.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf-8'))
    })
    
    stream.on('error', (error) => {
      reject(error)
    })
  })
}

// 部分读取文件（超大文件）
async function readFilePartial(filePath: string, maxLines: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath, { encoding: 'utf-8' })
    let lineCount = 0
    let content = ''
    let remainder = ''
    
    stream.on('data', (chunk: string | Buffer) => {
      const chunkStr = chunk.toString()
      const lines = (remainder + chunkStr).split('\n')
      remainder = lines.pop() || ''
      
      for (const line of lines) {
        if (lineCount < maxLines) {
          content += line + '\n'
          lineCount++
        } else {
          stream.destroy()
          content += '\n\n[文件过大，仅显示前 ' + maxLines + ' 行...]'
          resolve(content)
          return
        }
      }
    })
    
    stream.on('end', () => {
      if (remainder && lineCount < maxLines) {
        content += remainder
      }
      resolve(content)
    })
    
    stream.on('error', (error) => {
      reject(error)
    })
  })
}

// Write file content
ipcMain.handle('write-file', async (_, filePath: string, content: string) => {
  try {
    fs.writeFileSync(filePath, content, 'utf-8')
    return true
  } catch (error) {
    console.error('Error writing file:', error)
    return false
  }
})

// Create new file
ipcMain.handle('create-file', async (_, dirPath: string, fileName: string) => {
  try {
    const filePath = path.join(dirPath, fileName)
    if (fs.existsSync(filePath)) {
      return { success: false, error: 'File already exists' }
    }
    fs.writeFileSync(filePath, '', 'utf-8')
    return { success: true, path: filePath }
  } catch (error) {
    return { success: false, error: String(error) }
  }
})

// Create new directory
ipcMain.handle('create-directory', async (_, dirPath: string, dirName: string) => {
  try {
    const newDirPath = path.join(dirPath, dirName)
    if (fs.existsSync(newDirPath)) {
      return { success: false, error: 'Directory already exists' }
    }
    fs.mkdirSync(newDirPath, { recursive: true })
    return { success: true, path: newDirPath }
  } catch (error) {
    return { success: false, error: String(error) }
  }
})

// Delete file or directory
ipcMain.handle('delete-item', async (_, itemPath: string) => {
  try {
    // 防止删除根目录或关键系统目录
    const blockedPaths = ['/', '/home', '/Users', 'C:\\', 'C:\\Windows']
    if (blockedPaths.includes(itemPath) || itemPath.length < 4) {
      return { success: false, error: 'Cannot delete system directories' }
    }
    
    const stat = fs.statSync(itemPath)
    if (stat.isDirectory()) {
      fs.rmSync(itemPath, { recursive: true })
    } else {
      fs.unlinkSync(itemPath)
    }
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
})

// Rename file or directory
ipcMain.handle('rename-item', async (_, oldPath: string, newName: string) => {
  try {
    const dir = path.dirname(oldPath)
    const newPath = path.join(dir, newName)
    
    // 检查目标路径是否已存在
    if (fs.existsSync(newPath)) {
      return { success: false, error: '目标名称已存在' }
    }
    
    fs.renameSync(oldPath, newPath)
    return { success: true, newPath }
  } catch (error) {
    return { success: false, error: String(error) }
  }
})

// Watch directory for changes
ipcMain.handle('watch-directory', async (_, dirPath: string) => {
  if (watchers.has(dirPath)) {
    return true
  }

  const watcher = watch(dirPath, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    ignoreInitial: true,
  })

  watcher.on('all', (event, filePath) => {
    if (mainWindow) {
      mainWindow.webContents.send('directory-changed', { event, path: filePath })
    }
  })

  watchers.set(dirPath, watcher)
  return true
})

// Stop watching directory
ipcMain.handle('unwatch-directory', async (_, dirPath: string) => {
  const watcher = watchers.get(dirPath)
  if (watcher) {
    await watcher.close()
    watchers.delete(dirPath)
  }
  return true
})

// 安全的 URL 验证函数
function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

// Open external link
ipcMain.handle('open-external', async (_, url: string) => {
  if (!isSafeUrl(url)) {
    console.error(`Blocked unsafe URL: ${url}`)
    return
  }
  await shell.openExternal(url)
})

// Get app path
ipcMain.handle('get-app-path', async () => {
  return app.getPath('userData')
})

// Check if path exists
ipcMain.handle('path-exists', async (_, checkPath: string) => {
  return fs.existsSync(checkPath)
})
