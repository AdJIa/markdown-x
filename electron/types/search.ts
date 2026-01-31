/**
 * 搜索功能相关类型定义
 * @module search
 */

/**
 * 搜索结果项
 */
export interface SearchResult {
  /** 唯一标识符 */
  id: string
  /** 文件完整路径 */
  filePath: string
  /** 文件名 */
  fileName: string
  /** 所属站点 ID */
  siteId: string
  /** 匹配行号 */
  lineNumber: number
  /** 匹配列号 */
  column: number
  /** 匹配行预览文本 */
  preview: string
  /** 所有匹配位置 */
  matches: Array<{
    /** 匹配起始位置 */
    start: number
    /** 匹配结束位置 */
    end: number
  }>
}

/**
 * 搜索请求参数
 */
export interface SearchRequest {
  /** 搜索关键词 */
  keyword: string
  /** 指定搜索的站点 ID，默认全部 */
  siteIds?: string[]
  /** 最大结果数，默认 100 */
  maxResults?: number
}

/**
 * 搜索响应结果
 */
export interface SearchResponse {
  /** 搜索结果列表 */
  results: SearchResult[]
  /** 文件总数 */
  totalFiles: number
  /** 已搜索文件数 */
  searchedFiles: number
  /** 搜索耗时（毫秒） */
  searchTime: number
  /** 是否截断了结果 */
  truncated: boolean
}

/**
 * 搜索历史记录项
 */
export interface SearchHistoryItem {
  /** 唯一标识符 */
  id: string
  /** 搜索关键词 */
  keyword: string
  /** 搜索时间戳 */
  timestamp: number
  /** 结果数量 */
  resultCount: number
}

/**
 * 搜索进度
 */
export interface SearchProgress {
  /** 已搜索文件数 */
  searchedFiles: number
  /** 文件总数 */
  totalFiles: number
}

/**
 * 搜索错误码
 */
export enum SearchErrorCode {
  /** 关键词无效 */
  INVALID_KEYWORD = 'INVALID_KEYWORD',
  /** 没有可搜索的站点 */
  NO_SITES = 'NO_SITES',
  /** 搜索超时 */
  SEARCH_TIMEOUT = 'SEARCH_TIMEOUT',
  /** 文件访问被拒绝 */
  FILE_ACCESS_DENIED = 'FILE_ACCESS_DENIED',
  /** 搜索被取消 */
  SEARCH_CANCELLED = 'SEARCH_CANCELLED',
  /** 未知错误 */
  UNKNOWN = 'UNKNOWN'
}

/**
 * 搜索错误
 */
export interface SearchError {
  /** 错误码 */
  code: SearchErrorCode
  /** 错误消息 */
  message: string
}

/**
 * 文本匹配结果
 */
export interface MatchResult {
  /** 行号 */
  lineNumber: number
  /** 列号 */
  column: number
  /** 匹配的文本 */
  match: string
}

/**
 * 搜索状态
 */
export interface SearchState {
  /** 当前搜索关键词 */
  keyword: string
  /** 搜索结果 */
  results: SearchResult[]
  /** 是否正在搜索 */
  isSearching: boolean
  /** 搜索历史 */
  history: SearchHistoryItem[]
  /** 当前错误 */
  error: SearchError | null
  /** 搜索进度 */
  progress: SearchProgress | null
}

/**
 * SearchContext 值
 */
export interface SearchContextValue extends SearchState {
  /** 设置搜索关键词 */
  setKeyword: (keyword: string) => void
  /** 执行搜索 */
  performSearch: () => Promise<void>
  /** 取消搜索 */
  cancelSearch: () => void
  /** 清除历史记录 */
  clearHistory: () => void
  /** 打开/关闭搜索面板 */
  isOpen: boolean
  openSearch: () => void
  closeSearch: () => void
}

/**
 * 站点信息
 */
export interface Site {
  id: string
  name: string
  path: string
  icon?: string
  createdAt: number
  enableWatcher: boolean
}
