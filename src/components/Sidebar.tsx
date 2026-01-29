import { useState, useEffect, useCallback } from 'react'
import { useSites } from '../contexts/SiteContext'
import { useTheme } from '../contexts/ThemeContext'
import { FileItem } from '../types'
import FileTree from './FileTree'
import '../styles/Sidebar.css'

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  onFileSelect: (file: FileItem) => void
  onFileDelete?: (file: FileItem) => void
  onOpenSiteManager: () => void
  currentFile: FileItem | null
}

type SidebarTab = 'explorer' | 'search' | 'settings'

function Sidebar({ collapsed, onToggleCollapse, onFileSelect, onFileDelete, onOpenSiteManager, currentFile }: SidebarProps) {
  const { currentSite, sites } = useSites()
  const { currentTheme, themes, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<SidebarTab>('explorer')
  const [files, setFiles] = useState<FileItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<FileItem[]>([])

  const loadFiles = useCallback(async () => {
    if (!currentSite || !window.electronAPI?.readDirectory) return
    const items = await window.electronAPI.readDirectory(currentSite.path)
    setFiles(items)
  }, [currentSite])

  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  useEffect(() => {
    if (!currentSite?.enableWatcher || !window.electronAPI?.watchDirectory) return

    // 先清理旧的监听器，防止重复添加
    window.electronAPI.removeDirectoryChangedListener()
    
    window.electronAPI.watchDirectory(currentSite.path)
    window.electronAPI.onDirectoryChanged(() => {
      loadFiles()
    })

    return () => {
      window.electronAPI?.unwatchDirectory(currentSite.path)
      window.electronAPI?.removeDirectoryChangedListener()
    }
  }, [currentSite, loadFiles])

  const flattenFiles = (items: FileItem[]): FileItem[] => {
    return items.reduce<FileItem[]>((acc, item) => {
      if (item.type === 'file') {
        acc.push(item)
      }
      if (item.children) {
        acc.push(...flattenFiles(item.children))
      }
      return acc
    }, [])
  }

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    
    const allFiles = flattenFiles(files)
    const query = searchQuery.toLowerCase()
    const results = allFiles.filter(
      (f) => f.name.toLowerCase().includes(query) && 
             (f.extension === '.md' || f.extension === '.markdown')
    )
    setSearchResults(results)
  }, [searchQuery, files])

  const handleCreateFile = async () => {
    if (!currentSite || !window.electronAPI?.createFile) return
    const fileName = prompt('输入文件名:')
    if (!fileName) return
    
    const name = fileName.endsWith('.md') ? fileName : `${fileName}.md`
    const result = await window.electronAPI.createFile(currentSite.path, name)
    if (result.success) {
      loadFiles()
    } else {
      alert(result.error)
    }
  }

  const handleCreateFolder = async () => {
    if (!currentSite || !window.electronAPI?.createDirectory) return
    const folderName = prompt('输入文件夹名:')
    if (!folderName) return
    
    const result = await window.electronAPI.createDirectory(currentSite.path, folderName)
    if (result.success) {
      loadFiles()
    } else {
      alert(result.error)
    }
  }

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-tabs">
        <button
          className={`tab-btn ${activeTab === 'explorer' ? 'active' : ''}`}
          onClick={() => setActiveTab('explorer')}
          title="资源管理器"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
        <button
          className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
          title="搜索"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </button>
        <button
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
          title="设置"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
        
        <div className="tab-spacer" />
        
        <button
          className="tab-btn"
          onClick={onOpenSiteManager}
          title="站点管理"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <path d="M8 21h8M12 17v4"/>
          </svg>
        </button>
      </div>

      <div className="sidebar-content">
        {activeTab === 'explorer' && (
          <div className="explorer-panel">
            <div className="panel-header">
              <span className="panel-title">
                {currentSite?.name || '未选择站点'}
              </span>
              <div className="panel-actions">
                <button onClick={handleCreateFile} title="新建文件">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <path d="M14 2v6h6M12 18v-6M9 15h6"/>
                  </svg>
                </button>
                <button onClick={handleCreateFolder} title="新建文件夹">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    <path d="M12 11v6M9 14h6"/>
                  </svg>
                </button>
                <button onClick={loadFiles} title="刷新">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 4v6h-6M1 20v-6h6"/>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="file-tree-container">
              {currentSite ? (
                <FileTree
                  items={files}
                  onSelect={onFileSelect}
                  onRefresh={loadFiles}
                  onDelete={onFileDelete}
                  currentFile={currentFile}
                />
              ) : (
                <div className="empty-state">
                  <p>未选择站点</p>
                  <button onClick={onOpenSiteManager}>选择站点</button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="search-panel">
            <div className="search-input-wrapper">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="搜索文件..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="search-results">
              {searchResults.map((file) => (
                <button
                  key={file.path}
                  className="search-result-item"
                  onClick={() => onFileSelect(file)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <path d="M14 2v6h6"/>
                  </svg>
                  <span className="result-name">{file.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-panel">
            <div className="setting-section">
              <h3 className="setting-title">主题</h3>
              <div className="theme-list">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    className={`theme-item ${currentTheme.id === theme.id ? 'active' : ''}`}
                    onClick={() => setTheme(theme.id)}
                  >
                    <span
                      className="theme-preview"
                      data-dark={theme.isDark}
                    />
                    <span className="theme-name">{theme.name}</span>
                    {currentTheme.id === theme.id && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="setting-section">
              <h3 className="setting-title">站点列表</h3>
              <div className="sites-list">
                {sites.map((site) => (
                  <div key={site.id} className="site-item">
                    <span className="site-name">{site.name}</span>
                    <span className="site-path">{site.path}</span>
                  </div>
                ))}
              </div>
              <button className="add-site-btn" onClick={onOpenSiteManager}>
                管理站点
              </button>
            </div>
          </div>
        )}
      </div>

      <button className="collapse-btn" onClick={onToggleCollapse}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {collapsed ? (
            <path d="m9 18 6-6-6-6"/>
          ) : (
            <path d="m15 18-6-6 6-6"/>
          )}
        </svg>
      </button>
    </aside>
  )
}

export default Sidebar
