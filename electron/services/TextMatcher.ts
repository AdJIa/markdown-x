/**
 * 文本匹配器 - 匹配关键词并提取预览
 */
import type { MatchResult } from '../../src/types/search'

export class TextMatcher {
  /**
   * 在内容中搜索关键词
   */
  match(content: string, keyword: string): MatchResult[] {
    const results: MatchResult[] = []
    const lines = content.split('\n')
    const lowerKeyword = keyword.toLowerCase()

    lines.forEach((line, lineIndex) => {
      let index = 0
      while (true) {
        const foundIndex = line.toLowerCase().indexOf(lowerKeyword, index)
        if (foundIndex === -1) break

        results.push({
          lineNumber: lineIndex + 1,
          column: foundIndex + 1,
          match: line.slice(foundIndex, foundIndex + keyword.length)
        })

        index = foundIndex + 1
      }
    })

    return results
  }

  /**
   * 提取匹配行的预览文本
   */
  extractPreview(line: string, column: number, keyword: string): string {
    const maxLength = 80
    const contextChars = 30

    const start = Math.max(0, column - 1 - contextChars)
    const end = Math.min(line.length, column - 1 + keyword.length + contextChars)

    let preview = line.slice(start, end)
    if (start > 0) preview = '...' + preview
    if (end < line.length) preview = preview + '...'

    return preview
  }
}
