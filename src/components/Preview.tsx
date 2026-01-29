import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import mermaid from 'mermaid'
import CodeBlock from './CodeBlock'
import '../styles/Preview.css'

interface PreviewProps {
  content: string
  isLargeFile?: boolean
}

function Preview({ content, isLargeFile }: PreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
    })
  }, [])

  useEffect(() => {
    if (!previewRef.current || isLargeFile) return

    const mermaidBlocks = previewRef.current.querySelectorAll('.language-mermaid')
    let isCancelled = false
    
    mermaidBlocks.forEach(async (block, index) => {
      const code = block.textContent || ''
      if (!code.trim()) return
      
      const id = `mermaid-${index}-${Date.now()}`
      
      try {
        const { svg } = await mermaid.render(id, code)
        if (isCancelled) return
        
        const wrapper = document.createElement('div')
        wrapper.className = 'mermaid-diagram'
        wrapper.innerHTML = svg
        block.parentElement?.replaceWith(wrapper)
      } catch (e) {
        console.error('Mermaid rendering error:', e)
      }
    })
    
    return () => {
      isCancelled = true
    }
  }, [content, isLargeFile])

  if (!content) {
    return (
      <div className="preview-wrapper">
        <div className="preview-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <p>预览将在此处显示</p>
        </div>
      </div>
    )
  }

  return (
    <div className="preview-wrapper">
      <div className="preview-content" ref={previewRef}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex, rehypeRaw]}
          components={{
            h1: ({ children }) => <h1 className="heading-1">{children}</h1>,
            h2: ({ children }) => <h2 className="heading-2">{children}</h2>,
            h3: ({ children }) => <h3 className="heading-3">{children}</h3>,
            h4: ({ children }) => <h4 className="heading-4">{children}</h4>,
            h5: ({ children }) => <h5 className="heading-5">{children}</h5>,
            h6: ({ children }) => <h6 className="heading-6">{children}</h6>,
            a: ({ href, children }) => (
              <a
                href={href}
                onClick={(e) => {
                  if (href?.startsWith('http')) {
                    e.preventDefault()
                    window.electronAPI.openExternal(href)
                  }
                }}
              >
                {children}
              </a>
            ),
            img: ({ src, alt }) => (
              <img src={src} alt={alt || ''} loading="lazy" />
            ),
            table: ({ children }) => (
              <div className="table-wrapper">
                <table>{children}</table>
              </div>
            ),
            code: ({ className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || '')
              const language = match?.[1] || 'text'
              const code = String(children).replace(/\n$/, '')
              const isInline = !match && !code.includes('\n')
              
              return (
                <CodeBlock
                  code={code}
                  language={language}
                  isInline={isInline}
                />
              )
            },
            pre: ({ children }) => {
              // CodeBlock 组件已经处理了 pre 标签
              return <>{children}</>
            },
            blockquote: ({ children }) => (
              <blockquote className="blockquote">{children}</blockquote>
            ),
            ul: ({ children }) => <ul className="list-ul">{children}</ul>,
            ol: ({ children }) => <ol className="list-ol">{children}</ol>,
            li: ({ children }) => <li className="list-item">{children}</li>,
            hr: () => <hr className="divider" />,
            input: ({ type, checked, ...props }) => {
              if (type === 'checkbox') {
                return (
                  <input
                    type="checkbox"
                    checked={checked}
                    readOnly
                    className="task-checkbox"
                    {...props}
                  />
                )
              }
              return <input type={type} {...props} />
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
}

export default Preview
