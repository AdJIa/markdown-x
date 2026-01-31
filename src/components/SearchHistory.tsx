/**
 * 搜索历史组件
 */
import React from 'react'
import { Clock } from 'lucide-react'
import { useSearch } from '../contexts/SearchContext'

export const SearchHistory: React.FC = () => {
  const { history, setKeyword, performSearch, clearHistory } = useSearch()

  const handleClick = (keyword: string) => {
    setKeyword(keyword)
    performSearch()
  }

  if (history.length === 0) {
    return (
      <div className="search-empty">
        <Clock size={24} style={{ marginBottom: 8, opacity: 0.5 }} />
        搜索历史为空
      </div>
    )
  }

  return (
    <div className="search-history">
      <div className="search-history-title">
        搜索历史
        <button onClick={clearHistory} style={{ float: 'right', fontSize: 12 }}>
          清除
        </button>
      </div>
      {history.map((item) => (
        <div
          key={item.id}
          className="search-history-item"
          onClick={() => handleClick(item.keyword)}
        >
          <span className="search-history-keyword">{item.keyword}</span>
          <span className="search-history-count">{item.resultCount} 个结果</span>
        </div>
      ))}
    </div>
  )
}
