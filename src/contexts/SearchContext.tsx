/**
 * 搜索状态管理 Context
 */
import React, { createContext, useContext, useReducer, useCallback } from 'react'
import type { 
  SearchState, 
  SearchContextValue, 
  SearchRequest,
  SearchProgress,
  SearchError
} from '../types/search'

// 使用常量代替 enum 避免 vite 构建问题
const ErrorCode = {
  INVALID_KEYWORD: 'INVALID_KEYWORD',
  UNKNOWN: 'UNKNOWN'
} as const

type SearchAction =
  | { type: 'SET_KEYWORD'; payload: string }
  | { type: 'START_SEARCH' }
  | { type: 'SET_RESULTS'; payload: { results: SearchState['results']; truncated: boolean } }
  | { type: 'SET_ERROR'; payload: SearchState['error'] }
  | { type: 'SET_PROGRESS'; payload: SearchProgress | null }
  | { type: 'CANCEL_SEARCH' }
  | { type: 'SET_HISTORY'; payload: SearchState['history'] }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'OPEN_SEARCH' }
  | { type: 'CLOSE_SEARCH' }

const initialState: SearchState = {
  keyword: '',
  results: [],
  isSearching: false,
  history: [],
  error: null,
  progress: null
}

function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case 'SET_KEYWORD':
      return { ...state, keyword: action.payload }
    case 'START_SEARCH':
      return { 
        ...state, 
        isSearching: true, 
        results: [], 
        error: null,
        progress: { searchedFiles: 0, totalFiles: 0 }
      }
    case 'SET_RESULTS':
      return { 
        ...state, 
        isSearching: false, 
        results: action.payload.results,
        progress: null
      }
    case 'SET_ERROR':
      return { ...state, isSearching: false, error: action.payload, progress: null }
    case 'SET_PROGRESS':
      return { ...state, progress: action.payload }
    case 'CANCEL_SEARCH':
      return { ...state, isSearching: false, progress: null }
    case 'SET_HISTORY':
      return { ...state, history: action.payload }
    case 'CLEAR_HISTORY':
      return { ...state, history: [] }
    default:
      return state
  }
}

const SearchContext = createContext<SearchContextValue | null>(null)

export const useSearch = (): SearchContextValue => {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider')
  }
  return context
}

interface SearchProviderProps {
  children: React.ReactNode
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(searchReducer, initialState)
  const [isOpen, setIsOpen] = React.useState(false)

  // 加载历史记录
  React.useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await window.electronAPI.searchGetHistory()
        dispatch({ type: 'SET_HISTORY', payload: history })
      } catch (error) {
        console.error('Failed to load search history:', error)
      }
    }
    loadHistory()
  }, [])

  // 监听搜索进度
  React.useEffect(() => {
    const unsubscribe = window.electronAPI.onSearchProgress((progress) => {
      dispatch({ type: 'SET_PROGRESS', payload: progress })
    })
    return unsubscribe
  }, [])

  const setKeyword = useCallback((keyword: string) => {
    dispatch({ type: 'SET_KEYWORD', payload: keyword })
  }, [])

  const performSearch = useCallback(async () => {
    if (!state.keyword || state.keyword.length < 2) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { code: ErrorCode.INVALID_KEYWORD as SearchError['code'], message: '关键词至少需要 2 个字符' }
      })
      return
    }

    dispatch({ type: 'START_SEARCH' })

    try {
      const request: SearchRequest = {
        keyword: state.keyword,
        maxResults: 100
      }

      const response = await window.electronAPI.searchQuery(request)
      dispatch({ 
        type: 'SET_RESULTS', 
        payload: { results: response.results, truncated: response.truncated }
      })

      // 刷新历史记录
      const history = await window.electronAPI.searchGetHistory()
      dispatch({ type: 'SET_HISTORY', payload: history })
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { 
          code: ErrorCode.UNKNOWN as SearchError['code'], 
          message: error instanceof Error ? error.message : '搜索失败'
        }
      })
    }
  }, [state.keyword])

  const cancelSearch = useCallback(() => {
    window.electronAPI.searchCancel()
    dispatch({ type: 'CANCEL_SEARCH' })
  }, [])

  const clearHistory = useCallback(async () => {
    await window.electronAPI.searchSaveToHistory({ keyword: '', timestamp: 0, resultCount: 0 })
    dispatch({ type: 'CLEAR_HISTORY' })
  }, [])

  const openSearch = useCallback(() => {
    setIsOpen(true)
  }, [])

  const closeSearch = useCallback(() => {
    setIsOpen(false)
    if (state.isSearching) {
      cancelSearch()
    }
  }, [state.isSearching, cancelSearch])

  const value: SearchContextValue = {
    ...state,
    isOpen,
    setKeyword,
    performSearch,
    cancelSearch,
    clearHistory,
    openSearch,
    closeSearch
  }

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  )
}
