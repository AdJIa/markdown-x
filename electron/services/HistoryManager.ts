/**
 * 历史记录管理器
 */
import Store from 'electron-store'
import type { SearchHistoryItem } from '../types/search'

interface HistoryStore {
  searchHistory: SearchHistoryItem[]
}

export class HistoryManager {
  private store: Store<HistoryStore>
  private maxHistoryItems = 50

  constructor() {
    this.store = new Store<HistoryStore>({
      name: 'search-history',
      defaults: {
        searchHistory: []
      }
    })
  }

  /**
   * 获取所有历史记录
   */
  getAll(): SearchHistoryItem[] {
    return this.store.get('searchHistory', [])
  }

  /**
   * 添加历史记录
   */
  add(keyword: string, resultCount: number): void {
    const history = this.getAll()
    
    // 检查是否已存在相同关键词
    const existingIndex = history.findIndex(h => h.keyword === keyword)
    if (existingIndex !== -1) {
      // 移除旧的，新的会添加到开头
      history.splice(existingIndex, 1)
    }

    const newItem: SearchHistoryItem = {
      id: Date.now().toString(),
      keyword,
      timestamp: Date.now(),
      resultCount
    }

    history.unshift(newItem)
    
    // 限制数量
    if (history.length > this.maxHistoryItems) {
      history.length = this.maxHistoryItems
    }

    this.store.set('searchHistory', history)
  }

  /**
   * 清空历史记录
   */
  clear(): void {
    this.store.set('searchHistory', [])
  }

  /**
   * 删除单条历史
   */
  remove(id: string): void {
    const history = this.getAll()
    const filtered = history.filter(h => h.id !== id)
    this.store.set('searchHistory', filtered)
  }
}
