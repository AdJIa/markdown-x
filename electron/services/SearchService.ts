/**
 * 搜索服务 - 主搜索逻辑
 */
import { FileScanner } from './FileScanner'
import { ContentReader } from './ContentReader'
import { TextMatcher } from './TextMatcher'
import { HistoryManager } from './HistoryManager'
import type { 
  SearchRequest, 
  SearchResponse, 
  SearchResult, 
  SearchHistoryItem,
  Site
} from '../types/search'

export class SearchService {
  private fileScanner: FileScanner
  private contentReader: ContentReader
  private textMatcher: TextMatcher
  private historyManager: HistoryManager
  private abortController: AbortController | null = null
  private progressCallback: ((searched: number, total: number) => void) | null = null

  constructor() {
    this.fileScanner = new FileScanner()
    this.contentReader = new ContentReader()
    this.textMatcher = new TextMatcher()
    this.historyManager = new HistoryManager()
  }

  /**
   * 设置进度回调
   */
  onProgress(callback: (searched: number, total: number) => void): () => void {
    this.progressCallback = callback
    return () => {
      this.progressCallback = null
    }
  }

  /**
   * 执行搜索
   */
  async search(request: SearchRequest, sites: Site[]): Promise<SearchResponse> {
    const startTime = Date.now()
    this.abortController = new AbortController()
    
    const maxResults = request.maxResults || 100
    const results: SearchResult[] = []

    // 扫描文件
    const files = await this.fileScanner.scan(sites)
    const totalFiles = files.length

    // 分批处理，控制并发
    const batchSize = 10
    for (let i = 0; i < files.length; i += batchSize) {
      // 检查是否被取消
      if (this.abortController.signal.aborted) {
        break
      }

      const batch = files.slice(i, i + batchSize)
      const batchResults = await Promise.all(
        batch.map(filePath => this.searchFile(filePath, request.keyword, sites))
      )

      results.push(...batchResults.flat())

      // 发送进度
      if (this.progressCallback) {
        this.progressCallback(Math.min(i + batchSize, totalFiles), totalFiles)
      }

      // 检查是否达到最大结果数
      if (results.length >= maxResults) {
        results.length = maxResults
        break
      }
    }

    const searchTime = Date.now() - startTime

    // 保存到历史
    this.historyManager.add(request.keyword, results.length)

    return {
      results,
      totalFiles,
      searchedFiles: Math.min(files.length, totalFiles),
      searchTime,
      truncated: results.length >= maxResults
    }
  }

  /**
   * 搜索单个文件
   */
  private async searchFile(
    filePath: string, 
    keyword: string,
    sites: Site[]
  ): Promise<SearchResult[]> {
    const content = await this.contentReader.read(filePath)
    if (!content) return []

    const matches = this.textMatcher.match(content, keyword)
    if (matches.length === 0) return []

    const site = sites.find(s => filePath.startsWith(s.path))
    const fileName = filePath.split('/').pop() || ''

    return matches.map((match, index) => ({
      id: `${filePath}-${match.lineNumber}-${index}`,
      filePath,
      fileName,
      siteId: site?.id || '',
      lineNumber: match.lineNumber,
      column: match.column,
      preview: this.textMatcher.extractPreview(
        content.split('\n')[match.lineNumber - 1] || '',
        match.column,
        keyword
      ),
      matches: [{
        start: match.column - 1,
        end: match.column - 1 + keyword.length
      }]
    }))
  }

  /**
   * 取消搜索
   */
  cancel(): void {
    if (this.abortController) {
      this.abortController.abort()
    }
  }

  /**
   * 获取搜索历史
   */
  getHistory(): SearchHistoryItem[] {
    return this.historyManager.getAll()
  }

  /**
   * 清空历史
   */
  clearHistory(): void {
    this.historyManager.clear()
  }
}
