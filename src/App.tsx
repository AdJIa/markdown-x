import { useState, useCallback, useEffect, useRef } from 'react'
import Sidebar from './components/Sidebar'
import Editor from './components/Editor'
import Preview from './components/Preview'
import SiteManager from './components/SiteManager'
import { useSites } from './contexts/SiteContext'
import { FileItem } from './types'
import './styles/App.css'

type ViewMode = 'editor' | 'preview' | 'split'

// 文件大小阈值（1MB 以上视为大文件）
const LARGE_FILE_THRESHOLD = 1024 * 1024

function App() {
  const { currentSite } = useSites()
  const [showSiteManager, setShowSiteManager] = useState(false)
  const [currentFile, setCurrentFile] = useState<FileItem | null>(null)
  const [content, setContent] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [isDirty, setIsDirty] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isLargeFile, setIsLargeFile] = useState(false)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!currentSite) {
      setShowSiteManager(true)
    }
    setCurrentFile(null)
    setContent('')
    setIsDirty(false)
  }, [currentSite])

  // 清理加载超时
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
  }, [])

  const handleFileSelect = useCallback(async (file: FileItem) => {
    if (file.type !== 'file') return
    
    if (isDirty && currentFile) {
      const confirmed = window.confirm('当前文件有未保存的更改，是否丢弃？')
      if (!confirmed) return
    }

    // 清除之前的超时
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
    }

    // 延迟显示加载状态（避免小文件闪烁）
    loadingTimeoutRef.current = setTimeout(() => {
      setIsLoading(true)
      setLoadingProgress(0)
    }, 150)

    try {
      // 先检查文件大小
      const fileStats = await window.electronAPI.getFileStats?.(file.path)
      const fileSize = fileStats?.size || 0
      
      setIsLargeFile(fileSize > LARGE_FILE_THRESHOLD)

      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => Math.min(prev + 10, 90))
      }, 50)

      const fileContent = await window.electronAPI.readFile(file.path)
      
      clearInterval(progressInterval)
      setLoadingProgress(100)

      if (fileContent !== null) {
        setCurrentFile(file)
        setContent(fileContent)
        setIsDirty(false)
      } else {
        alert(`无法读取文件: ${file.name}\n可能是文件过大、编码不支持或无访问权限`)
      }
    } catch (error) {
      console.error('Error reading file:', error)
      alert(`读取文件时发生错误: ${file.name}`)
    } finally {
      // 延迟关闭加载状态，让用户看到完成
      setTimeout(() => {
        setIsLoading(false)
        setLoadingProgress(0)
      }, 200)
      
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }
    }
  }, [isDirty, currentFile])

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent)
    setIsDirty(true)
  }, [])

  const handleFileDelete = useCallback((file: FileItem) => {
    if (currentFile?.path === file.path) {
      setCurrentFile(null)
      setContent('')
      setIsDirty(false)
    }
  }, [currentFile])

  const handleSave = useCallback(async () => {
    if (!currentFile) return
    
    try {
      const success = await window.electronAPI.writeFile(currentFile.path, content)
      if (success) {
        setIsDirty(false)
      } else {
        alert(`保存失败: ${currentFile.name}\n请检查文件是否可写`)
      }
    } catch (error) {
      console.error('Error saving file:', error)
      alert(`保存文件时发生错误: ${currentFile.name}`)
    }
  }, [currentFile, content])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSave])

  return (
    <div className="app">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onFileSelect={handleFileSelect}
        onFileDelete={handleFileDelete}
        onOpenSiteManager={() => setShowSiteManager(true)}
        currentFile={currentFile}
      />
      
      <main className="main-content">
        <header className="toolbar">
          <div className="toolbar-left">
            {currentFile && (
              <div className="file-info">
                <span className="file-name">
                  {currentFile.name}
                  {isDirty && <span className="dirty-indicator">*</span>}
                  {isLargeFile && <span className="large-file-badge" title="大文件">⚡</span>}
                </span>
                <span className="file-path">{currentFile.path}</span>
              </div>
            )}
          </div>
          <div className="toolbar-center">
            <div className="view-mode-switcher">
              <button
                className={`view-mode-btn ${viewMode === 'editor' ? 'active' : ''}`}
                onClick={() => setViewMode('editor')}
                title="仅编辑器"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </button>
              <button
                className={`view-mode-btn ${viewMode === 'split' ? 'active' : ''}`}
                onClick={() => setViewMode('split')}
                title="分屏视图"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <line x1="12" y1="3" x2="12" y2="21"/>
                </svg>
              </button>
              <button
                className={`view-mode-btn ${viewMode === 'preview' ? 'active' : ''}`}
                onClick={() => setViewMode('preview')}
                title="仅预览"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
          </div>
          <div className="toolbar-right">
            {isLoading && (
              <div className="loading-indicator">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${loadingProgress}%` }} />
                </div>
                <span className="loading-text">{loadingProgress}%</span>
              </div>
            )}
            {isDirty && !isLoading && (
              <button className="save-btn" onClick={handleSave}>
                保存
              </button>
            )}
          </div>
        </header>

        <div className={`editor-container ${viewMode}`}>
          {(viewMode === 'editor' || viewMode === 'split') && (
            <Editor
              content={content}
              onChange={handleContentChange}
              filePath={currentFile?.path}
              isLoading={isLoading}
            />
          )}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <Preview 
              content={content} 
              isLargeFile={isLargeFile}
            />
          )}
        </div>
      </main>

      {showSiteManager && (
        <SiteManager onClose={() => setShowSiteManager(false)} />
      )}
    </div>
  )
}

export default App
