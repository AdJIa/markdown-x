import { useMemo } from 'react'
import '../styles/WordCount.css'

interface WordCountProps {
  content: string
}

function WordCount({ content }: WordCountProps) {
  const stats = useMemo(() => {
    // 计算字符数（不含空白）
    const charCount = content.replace(/\s/g, '').length
    
    // 计算字数
    // 中文按字计算，英文按词计算
    const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length
    const englishWords = (content.match(/[a-zA-Z]+/g) || []).length
    const wordCount = chineseChars + englishWords
    
    // 预估阅读时间（按每分钟 300 字/词计算）
    const readingTime = Math.max(1, Math.ceil(wordCount / 300))
    
    // 行数
    const lineCount = content ? content.split('\n').length : 0
    
    return {
      charCount,
      wordCount,
      readingTime,
      lineCount
    }
  }, [content])

  if (!content) {
    return null
  }

  return (
    <div className="word-count-bar">
      <div className="word-count-item">
        <span className="word-count-label">字数</span>
        <span className="word-count-value">{stats.wordCount.toLocaleString()}</span>
      </div>
      <div className="word-count-divider" />
      <div className="word-count-item">
        <span className="word-count-label">字符</span>
        <span className="word-count-value">{stats.charCount.toLocaleString()}</span>
      </div>
      <div className="word-count-divider" />
      <div className="word-count-item">
        <span className="word-count-label">行数</span>
        <span className="word-count-value">{stats.lineCount.toLocaleString()}</span>
      </div>
      <div className="word-count-divider" />
      <div className="word-count-item">
        <span className="word-count-label">阅读</span>
        <span className="word-count-value">{stats.readingTime} 分钟</span>
      </div>
    </div>
  )
}

export default WordCount
