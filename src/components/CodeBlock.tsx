import { useState, useCallback } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useTheme } from '../contexts/ThemeContext'
import '../styles/CodeBlock.css'

interface CodeBlockProps {
  code: string
  language: string
  isInline?: boolean
}

const LANGUAGE_NAMES: Record<string, string> = {
  js: 'JavaScript',
  jsx: 'JSX',
  ts: 'TypeScript',
  tsx: 'TSX',
  json: 'JSON',
  py: 'Python',
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
  c: 'C',
  cs: 'C#',
  go: 'Go',
  rust: 'Rust',
  php: 'PHP',
  ruby: 'Ruby',
  rb: 'Ruby',
  sh: 'Shell',
  bash: 'Bash',
  zsh: 'Zsh',
  sql: 'SQL',
  yaml: 'YAML',
  yml: 'YAML',
  xml: 'XML',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  sass: 'Sass',
  less: 'Less',
  md: 'Markdown',
  markdown: 'Markdown',
  dockerfile: 'Dockerfile',
  nginx: 'Nginx',
  vim: 'Vim',
  lua: 'Lua',
  swift: 'Swift',
  kotlin: 'Kotlin',
  scala: 'Scala',
  r: 'R',
  matlab: 'MATLAB',
  perl: 'Perl',
  groovy: 'Groovy',
  powershell: 'PowerShell',
  ps1: 'PowerShell',
  bat: 'Batch',
  cmd: 'Batch',
  graphql: 'GraphQL',
  regex: 'Regex',
  diff: 'Diff',
  docker: 'Docker',
  terraform: 'Terraform',
  hcl: 'HCL',
  toml: 'TOML',
  ini: 'INI',
  env: 'Environment',
  log: 'Log',
  plain: 'Plain Text',
  text: 'Plain Text',
  mermaid: 'Mermaid',
  'mermaid-js': 'Mermaid',
}

function CodeBlock({ code, language, isInline = false }: CodeBlockProps) {
  const { currentTheme } = useTheme()
  const [copied, setCopied] = useState(false)
  
  const normalizedLang = language?.toLowerCase() || 'text'
  const displayLang = LANGUAGE_NAMES[normalizedLang] || normalizedLang.toUpperCase() || 'Code'
  
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }, [code])
  
  if (isInline) {
    return <code className="inline-code">{code}</code>
  }
  
  const isDark = currentTheme.isDark
  const style = isDark ? vscDarkPlus : vs
  
  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-language">{displayLang}</span>
        <button 
          className={`copy-button ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
          title={copied ? '已复制!' : '复制代码'}
        >
          {copied ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              <span>已复制</span>
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              <span>复制</span>
            </>
          )}
        </button>
      </div>
      <div className="code-block-content">
        <SyntaxHighlighter
          language={normalizedLang === 'mermaid' ? 'javascript' : normalizedLang}
          style={style}
          customStyle={{
            margin: 0,
            padding: '16px',
            background: 'transparent',
            fontSize: '13px',
            lineHeight: '1.6',
          }}
          codeTagProps={{
            style: {
              fontFamily: 'var(--font-mono)',
            }
          }}
          showLineNumbers={code.split('\n').length > 3}
          lineNumberStyle={{
            minWidth: '3em',
            paddingRight: '1em',
            color: isDark ? '#6e7681' : '#a0a0a0',
            fontSize: '12px',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}

export default CodeBlock
