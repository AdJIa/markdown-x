import { useCallback } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { EditorView } from '@codemirror/view'
import { useTheme } from '../contexts/ThemeContext'
import '../styles/Editor.css'

interface EditorProps {
  content: string
  onChange: (content: string) => void
  filePath: string | null | undefined
}

function Editor({ content, onChange, filePath }: EditorProps) {
  const { currentTheme } = useTheme()

  const handleChange = useCallback((value: string) => {
    onChange(value)
  }, [onChange])

  const theme = EditorView.theme({
    '&': {
      height: '100%',
      fontSize: '14px',
    },
    '.cm-content': {
      fontFamily: 'var(--font-mono)',
      padding: '16px 0',
    },
    '.cm-line': {
      padding: '0 16px',
    },
    '.cm-gutters': {
      backgroundColor: 'transparent',
      borderRight: 'none',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'transparent',
    },
    '.cm-activeLine': {
      backgroundColor: 'var(--bg-hover)',
    },
    '.cm-selectionMatch': {
      backgroundColor: 'var(--bg-active)',
    },
    '&.cm-focused .cm-cursor': {
      borderLeftColor: 'var(--accent-primary)',
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
      backgroundColor: 'var(--bg-active)',
    },
    '.cm-scroller': {
      overflow: 'auto',
    },
  }, { dark: currentTheme.isDark })

  const extensions = [
    markdown({ base: markdownLanguage, codeLanguages: languages }),
    EditorView.lineWrapping,
    theme,
  ]

  if (!filePath) {
    return (
      <div className="editor-wrapper">
        <div className="editor-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <path d="M14 2v6h6"/>
            <path d="M16 13H8M16 17H8M10 9H8"/>
          </svg>
          <p>选择一个文件开始编辑</p>
        </div>
      </div>
    )
  }

  return (
    <div className="editor-wrapper">
      <CodeMirror
        value={content}
        onChange={handleChange}
        extensions={extensions}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          foldGutter: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: false,
          highlightSelectionMatches: true,
        }}
        className="code-mirror-wrapper"
      />
    </div>
  )
}

export default Editor
