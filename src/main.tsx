import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ThemeProvider } from './contexts/ThemeContext'
import { SiteProvider } from './contexts/SiteContext'
import { SearchProvider } from './contexts/SearchContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import './styles/index.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found. Please check your HTML file.')
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <SiteProvider>
          <SearchProvider>
            <App />
          </SearchProvider>
        </SiteProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
