import { useState } from 'react'
import { FileItem } from '../types'
import '../styles/FileTree.css'

interface FileTreeProps {
  items: FileItem[]
  onSelect: (file: FileItem) => void
  onRefresh: () => void
  onDelete?: (file: FileItem) => void
  currentFile: FileItem | null
  level?: number
}

interface FileTreeItemProps {
  item: FileItem
  onSelect: (file: FileItem) => void
  onRefresh: () => void
  onDelete?: (file: FileItem) => void
  currentFile: FileItem | null
  level: number
}

function FileTreeItem({ item, onSelect, onRefresh, onDelete, currentFile, level }: FileTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2)
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false)
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 })

  const isMarkdown = item.extension === '.md' || item.extension === '.markdown'
  const isActive = currentFile?.path === item.path

  const handleClick = () => {
    if (item.type === 'directory') {
      setIsExpanded(!isExpanded)
    } else {
      onSelect(item)
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenuPos({ x: e.clientX, y: e.clientY })
    setIsContextMenuOpen(true)
  }

  const handleDelete = async () => {
    setIsContextMenuOpen(false)
    const confirmed = window.confirm(`确定要删除 "${item.name}" 吗？`)
    if (!confirmed) return
    
    const result = await window.electronAPI.deleteItem(item.path)
    if (result.success) {
      onDelete?.(item)
      onRefresh()
    } else {
      alert(result.error)
    }
  }

  const handleRename = async () => {
    setIsContextMenuOpen(false)
    const newName = prompt('输入新名称:', item.name)
    if (!newName || newName === item.name) return
    
    const result = await window.electronAPI.renameItem(item.path, newName)
    if (result.success) {
      onRefresh()
    } else {
      alert(result.error)
    }
  }

  const getFileIcon = () => {
    if (item.type === 'directory') {
      return isExpanded ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
      )
    }
    
    if (isMarkdown) {
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <path d="M14 2v6h6"/>
          <path d="M16 13H8M16 17H8M10 9H8"/>
        </svg>
      )
    }
    
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <path d="M14 2v6h6"/>
      </svg>
    )
  }

  return (
    <div className="file-tree-item-wrapper">
      <button
        className={`file-tree-item ${isActive ? 'active' : ''} ${item.type}`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        {item.type === 'directory' && (
          <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </span>
        )}
        <span className="file-icon">{getFileIcon()}</span>
        <span className="file-name">{item.name}</span>
      </button>

      {item.type === 'directory' && isExpanded && item.children && (
        <div className="file-tree-children">
          {item.children.map((child) => (
            <FileTreeItem
              key={child.path}
              item={child}
              onSelect={onSelect}
              onRefresh={onRefresh}
              onDelete={onDelete}
              currentFile={currentFile}
              level={level + 1}
            />
          ))}
        </div>
      )}

      {isContextMenuOpen && (
        <>
          <div
            className="context-menu-overlay"
            onClick={() => setIsContextMenuOpen(false)}
          />
          <div
            className="context-menu"
            style={{ left: contextMenuPos.x, top: contextMenuPos.y }}
          >
            <button onClick={handleRename}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
              重命名
            </button>
            <button onClick={handleDelete} className="danger">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              删除
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function FileTree({ items, onSelect, onRefresh, onDelete, currentFile, level = 0 }: FileTreeProps) {
  return (
    <div className="file-tree">
      {items.map((item) => (
        <FileTreeItem
          key={item.path}
          item={item}
          onSelect={onSelect}
          onRefresh={onRefresh}
          onDelete={onDelete}
          currentFile={currentFile}
          level={level}
        />
      ))}
    </div>
  )
}

export default FileTree
