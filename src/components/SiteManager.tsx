import { useState } from 'react'
import { useSites } from '../contexts/SiteContext'
import { Site } from '../types'
import '../styles/SiteManager.css'

interface SiteManagerProps {
  onClose: () => void
}

type ModalView = 'list' | 'add' | 'link'

function SiteManager({ onClose }: SiteManagerProps) {
  const { sites, currentSite, addSite, removeSite, selectSite } = useSites()
  const [view, setView] = useState<ModalView>('list')
  const [newSiteName, setNewSiteName] = useState('')
  const [newSitePath, setNewSitePath] = useState('')
  const [enableWatcher, setEnableWatcher] = useState(true)

  const handleSelectDirectory = async () => {
    const selectedPath = await window.electronAPI.selectDirectory()
    if (selectedPath) {
      setNewSitePath(selectedPath)
      if (!newSiteName) {
        // 支持 Windows 和 Unix 路径分隔符
        const folderName = selectedPath.split(/[/\\]/).pop() || 'New Site'
        setNewSiteName(folderName)
      }
    }
  }

  const handleAddSite = async () => {
    if (!newSiteName.trim() || !newSitePath.trim()) return
    
    // Check if running in Electron environment
    if (window.electronAPI?.pathExists) {
      const exists = await window.electronAPI.pathExists(newSitePath)
      if (!exists) {
        alert('路径不存在')
        return
      }
    }

    await addSite(newSiteName.trim(), newSitePath.trim(), enableWatcher)
    setNewSiteName('')
    setNewSitePath('')
    setEnableWatcher(true)
    setView('list')
  }

  const handleCreateNewSite = async () => {
    const path = await window.electronAPI.selectDirectory()
    if (!path) return
    
    const siteName = prompt('输入站点名称:')
    if (!siteName) return

    await addSite(siteName, path, true)
    setView('list')
  }

  const handleDeleteSite = (site: Site) => {
    const confirmed = window.confirm(`确定要删除站点 "${site.name}" 吗？\n注意: 这不会删除实际文件。`)
    if (confirmed) {
      removeSite(site.id)
    }
  }

  const handleSelectSite = (site: Site) => {
    selectSite(site.id)
    onClose()
  }

  return (
    <div className="site-manager-overlay" onClick={onClose}>
      <div className="site-manager-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        {view === 'list' && (
          <>
            <div className="modal-header">
              <h2>站点管理</h2>
              <p className="modal-subtitle">管理您的 Markdown 站点和项目</p>
            </div>

            <div className="modal-actions">
              <button className="action-btn" onClick={handleCreateNewSite}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                新建站点
              </button>
              <button className="action-btn primary" onClick={() => setView('link')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
                链接本地文件夹
              </button>
            </div>

            <div className="sites-section">
              <h3 className="section-title">已有站点</h3>
              {sites.length === 0 ? (
                <div className="empty-sites">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                  </svg>
                  <p>暂无站点</p>
                  <span>点击上方按钮添加您的第一个站点</span>
                </div>
              ) : (
                <div className="sites-grid">
                  {sites.map((site) => (
                    <div
                      key={site.id}
                      className={`site-card ${currentSite?.id === site.id ? 'active' : ''}`}
                      onClick={() => handleSelectSite(site)}
                    >
                      <div className="site-card-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                        </svg>
                      </div>
                      <div className="site-card-info">
                        <span className="site-card-name">{site.name}</span>
                        <span className="site-card-path">{site.path}</span>
                      </div>
                      {site.enableWatcher && (
                        <span className="site-card-badge" title="实时监控">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M23 4v6h-6M1 20v-6h6"/>
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                          </svg>
                        </span>
                      )}
                      <button
                        className="site-card-delete"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteSite(site)
                        }}
                        title="删除站点"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {view === 'link' && (
          <>
            <div className="modal-header">
              <button className="back-btn" onClick={() => setView('list')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </button>
              <div>
                <h2>链接本地文件夹</h2>
                <p className="modal-subtitle">选择一个文件夹作为 Markdown 站点</p>
              </div>
            </div>

            <div className="link-form">
              <div className="form-group">
                <label>站点名称</label>
                <input
                  type="text"
                  placeholder="输入站点名称"
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>文件夹路径</label>
                <div className="path-input">
                  <input
                    type="text"
                    placeholder="选择文件夹路径"
                    value={newSitePath}
                    onChange={(e) => setNewSitePath(e.target.value)}
                  />
                  <button onClick={handleSelectDirectory}>浏览...</button>
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={enableWatcher}
                    onChange={(e) => setEnableWatcher(e.target.checked)}
                  />
                  <span className="checkbox-text">启用实时文件监控</span>
                </label>
                <span className="checkbox-hint">Markdown-X 将监控文件变化并自动同步</span>
              </div>

              <div className="form-actions">
                <button className="cancel-btn" onClick={() => setView('list')}>
                  取消
                </button>
                <button
                  className="submit-btn"
                  onClick={handleAddSite}
                  disabled={!newSiteName.trim() || !newSitePath.trim()}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  链接文件夹
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SiteManager
