import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Theme } from '../types'

const themes: Theme[] = [
  { id: 'light', name: 'Light', isDark: false },
  { id: 'dark', name: 'Dark', isDark: true },
  { id: 'github', name: 'GitHub', isDark: false },
  { id: 'dracula', name: 'Dracula', isDark: true },
  { id: 'nord', name: 'Nord', isDark: true },
  { id: 'solarized-light', name: 'Solarized Light', isDark: false },
]

interface ThemeContextType {
  currentTheme: Theme
  themes: Theme[]
  setTheme: (themeId: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[1])

  useEffect(() => {
    const savedThemeId = localStorage.getItem('markdown-x-theme')
    if (savedThemeId) {
      const theme = themes.find((t) => t.id === savedThemeId)
      if (theme) setCurrentTheme(theme)
    }
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme.id)
    localStorage.setItem('markdown-x-theme', currentTheme.id)
  }, [currentTheme])

  const setTheme = (themeId: string) => {
    const theme = themes.find((t) => t.id === themeId)
    if (theme) setCurrentTheme(theme)
  }

  return (
    <ThemeContext.Provider value={{ currentTheme, themes, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
