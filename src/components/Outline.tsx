import { useEffect, useState } from 'react'
import '../styles/Outline.css'

export interface HeadingItem {
  id: string
  level: number
  text: string
}

interface OutlineProps {
  content: string
  visible: boolean
}

function Outline({ content, visible }: OutlineProps) {
  const [headings, setHeadings] = useState<HeadingItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

  // 解析 Markdown 标题
  useEffect(() => {
    const lines = content.split('\n')
    const extractedHeadings: HeadingItem[] = []
    
    lines.forEach((line, index) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/)
      if (match) {
        const level = match[1].length
        const text = match[2].trim()
        extractedHeadings.push({
          id: `heading-${index}`,
          level,
          text
        })
      }
    })
    
    setHeadings(extractedHeadings)
  }, [content])

  // 监听滚动，高亮当前位置
  useEffect(() => {
    if (!visible || headings.length === 0) return

    const handleScroll = () => {
      const previewElement = document.querySelector('.preview-content')
      if (!previewElement) return

      const headingElements = previewElement.querySelectorAll('h1, h2, h3, h4, h5, h6')
      if (headingElements.length === 0) return

      let currentActiveIndex = -1
      const scrollTop = previewElement.scrollTop + 100

      for (let i = 0; i < headingElements.length; i++) {
        const element = headingElements[i] as HTMLElement
        if (element.offsetTop <= scrollTop) {
          currentActiveIndex = i
        }
      }

      if (currentActiveIndex >= 0 && currentActiveIndex < headings.length) {
        setActiveId(headings[currentActiveIndex].id)
      }
    }

    const previewElement = document.querySelector('.preview-content')
    if (previewElement) {
      previewElement.addEventListener('scroll', handleScroll)
      handleScroll() // 初始调用
    }

    return () => {
      if (previewElement) {
        previewElement.removeEventListener('scroll', handleScroll)
      }
    }
  }, [visible, headings])

  // 点击标题跳转
  const handleHeadingClick = (heading: HeadingItem) => {
    const id = `h-${heading.text.replace(/\s+/g, '-').toLowerCase().slice(0, 30)}`
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveId(heading.id)
    }
  }

  if (!visible || headings.length === 0) {
    return null
  }

  return (
    <div className="outline-panel">
      <div className="outline-header">
        <span>大纲</span>
      </div>
      <div className="outline-content">
        {headings.map((heading) => (
          <div
            key={heading.id}
            className={`outline-item level-${heading.level} ${activeId === heading.id ? 'active' : ''}`}
            onClick={() => handleHeadingClick(heading)}
            title={heading.text}
          >
            <span className="outline-text">{heading.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Outline
