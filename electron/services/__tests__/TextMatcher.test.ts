/**
 * TextMatcher 单元测试
 */
import { TextMatcher } from '../TextMatcher'

describe('TextMatcher', () => {
  let matcher: TextMatcher

  beforeEach(() => {
    matcher = new TextMatcher()
  })

  describe('match', () => {
    it('should find single occurrence', () => {
      const content = 'Hello world'
      const results = matcher.match(content, 'world')
      
      expect(results).toHaveLength(1)
      expect(results[0]).toEqual({
        lineNumber: 1,
        column: 7,
        match: 'world'
      })
    })

    it('should find multiple occurrences in same line', () => {
      const content = 'test test test'
      const results = matcher.match(content, 'test')
      
      expect(results).toHaveLength(3)
      expect(results[0].column).toBe(1)
      expect(results[1].column).toBe(6)
      expect(results[2].column).toBe(11)
    })

    it('should find occurrences across multiple lines', () => {
      const content = 'line one\nline two\nline three'
      const results = matcher.match(content, 'line')
      
      expect(results).toHaveLength(3)
      expect(results[0].lineNumber).toBe(1)
      expect(results[1].lineNumber).toBe(2)
      expect(results[2].lineNumber).toBe(3)
    })

    it('should be case insensitive', () => {
      const content = 'Hello World HELLO'
      const results = matcher.match(content, 'hello')
      
      expect(results).toHaveLength(2)
    })

    it('should return empty array when no match', () => {
      const content = 'Hello world'
      const results = matcher.match(content, 'notfound')
      
      expect(results).toHaveLength(0)
    })

    it('should handle empty content', () => {
      const results = matcher.match('', 'test')
      
      expect(results).toHaveLength(0)
    })

    it('should handle special characters', () => {
      const content = 'function test() { return true; }'
      const results = matcher.match(content, 'test()')
      
      expect(results).toHaveLength(1)
    })
  })

  describe('extractPreview', () => {
    it('should extract preview with context', () => {
      const line = 'This is a very long line with the keyword in the middle'
      const preview = matcher.extractPreview(line, 36, 'keyword')
      
      expect(preview).toContain('keyword')
      expect(preview.length).toBeLessThanOrEqual(80)
    })

    it('should add ellipsis for truncated content', () => {
      const line = 'Start of line with keyword and end of line content'
      const preview = matcher.extractPreview(line, 20, 'keyword')
      
      expect(preview).toContain('...')
    })

    it('should handle short lines', () => {
      const line = 'Short line'
      const preview = matcher.extractPreview(line, 1, 'Short')
      
      expect(preview).toBe('Short line')
    })

    it('should handle keyword at start', () => {
      const line = 'keyword at the start of the line'
      const preview = matcher.extractPreview(line, 1, 'keyword')
      
      expect(preview).not.toContain('...')
    })

    it('should handle keyword at end', () => {
      const line = 'This line ends with keyword'
      const column = line.indexOf('keyword') + 1
      const preview = matcher.extractPreview(line, column, 'keyword')
      
      expect(preview).not.toContain('...')
    })
  })
})
