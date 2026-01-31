/**
 * 搜索输入框组件
 */
import React, { useRef, useEffect } from 'react'
import { Search } from 'lucide-react'
import { useSearch } from '../contexts/SearchContext'

export const SearchInput: React.FC = () => {
  const { keyword, setKeyword, performSearch, isSearching } = useSearch()
  const inputRef = useRef<HTMLInputElement>(null)

  // 自动聚焦
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      performSearch()
    }
  }

  return (
    <div className="search-input-container">
      <Search className="search-icon" />
      <input
        ref={inputRef}
        type="text"
        className="search-input"
        placeholder="搜索文件内容..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isSearching}
      />
      <span className="search-shortcut">↵</span>
    </div>
  )
}
