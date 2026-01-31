/**
 * 搜索面板组件
 */
import React, { useEffect, useRef } from 'react'
import { useSearch } from '../contexts/SearchContext'
import { SearchInput } from './SearchInput'
import { SearchResults } from './SearchResults'
import { SearchHistory } from './SearchHistory'
import '../styles/search.css'

export const SearchPanel: React.FC = () => {
  const { isOpen, closeSearch, isSearching, progress, keyword } = useSearch()
  const panelRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        closeSearch()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, closeSearch])

  // ESC 关闭
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeSearch()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, closeSearch])

  if (!isOpen) return null

  return (
    <div className="search-panel-overlay">
      <div ref={panelRef} className="search-panel">
        <SearchInput />
        
        {isSearching && progress && (
          <div className="search-progress">
            搜索中... {progress.searchedFiles} / {progress.totalFiles} 文件
          </div>
        )}
        
        {!keyword && <SearchHistory />}
        {keyword && <SearchResults />}
      </div>
    </div>
  )
}
