/**
 * 搜索结果列表组件
 */
import React from 'react'
import { FileText } from 'lucide-react'
import { useSearch } from '../contexts/SearchContext'
import type { SearchResult } from '../types/search'

export const SearchResults: React.FC = () => {
  const { results, isSearching, error } = useSearch()

  if (isSearching && results.length === 0) {
    return <div className="search-loading">搜索中...</div>
  }

  if (error) {
    return <div className="search-empty">{error.message}</div>
  }

  if (results.length === 0) {
    return <div className="search-empty">未找到结果</div>
  }

  const handleClick = (result: SearchResult) => {
    // 打开文件并跳转到对应位置
    window.electronAPI.readFile(result.filePath).then((content) => {
      if (content !== null) {
        // TODO: 通过某种方式通知编辑器打开文件并跳转
        console.log('Open file:', result.filePath, 'line:', result.lineNumber)
      }
    })
  }

  const renderHighlightedPreview = (preview: string, keyword: string) => {
    const parts = preview.split(new RegExp(`(${keyword})`, 'gi'))
    return parts.map((part, index) => 
      part.toLowerCase() === keyword.toLowerCase() ? (
        <span key={index} className="search-result-highlight">{part}</span>
      ) : (
        <span key={index}>{part}</span>
      )
    )
  }

  const { keyword } = useSearch()

  return (
    <div className="search-results">
      {results.map((result) => (
        <div
          key={result.id}
          className="search-result-item"
          onClick={() => handleClick(result)}
        >
          <div className="search-result-file">
            <FileText size={14} />
            {result.fileName}
            <span>第 {result.lineNumber} 行</span>
          </div>
          <div className="search-result-preview">
            {renderHighlightedPreview(result.preview, keyword)}
          </div>
        </div>
      ))}
    </div>
  )
}
