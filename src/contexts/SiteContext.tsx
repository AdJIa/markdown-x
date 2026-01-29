import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Site } from '../types'
import { v4 as uuidv4 } from 'uuid'

interface SiteContextType {
  sites: Site[]
  currentSite: Site | null
  addSite: (name: string, path: string, enableWatcher?: boolean) => Promise<Site>
  removeSite: (siteId: string) => void
  updateSite: (siteId: string, updates: Partial<Site>) => void
  selectSite: (siteId: string) => void
}

const SiteContext = createContext<SiteContextType | undefined>(undefined)

const STORAGE_KEY = 'markdown-x-sites'

export function SiteProvider({ children }: { children: ReactNode }) {
  const [sites, setSites] = useState<Site[]>([])
  const [currentSite, setCurrentSite] = useState<Site | null>(null)

  useEffect(() => {
    const savedSites = localStorage.getItem(STORAGE_KEY)
    if (savedSites) {
      try {
        const parsed = JSON.parse(savedSites)
        setSites(parsed)
        if (parsed.length > 0) {
          setCurrentSite(parsed[0])
        }
      } catch (e) {
        console.error('Failed to parse saved sites:', e)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sites))
  }, [sites])

  const addSite = async (name: string, path: string, enableWatcher = true): Promise<Site> => {
    const newSite: Site = {
      id: uuidv4(),
      name,
      path,
      createdAt: Date.now(),
      enableWatcher,
    }
    setSites((prev) => [...prev, newSite])
    if (!currentSite) {
      setCurrentSite(newSite)
    }
    return newSite
  }

  const removeSite = (siteId: string) => {
    setSites((prev) => {
      const newSites = prev.filter((s) => s.id !== siteId)
      // 如果删除的是当前选中的站点，切换到第一个可用站点
      if (currentSite?.id === siteId) {
        setCurrentSite(newSites[0] || null)
      }
      return newSites
    })
  }

  const updateSite = (siteId: string, updates: Partial<Site>) => {
    setSites((prev) =>
      prev.map((s) => (s.id === siteId ? { ...s, ...updates } : s))
    )
    if (currentSite?.id === siteId) {
      setCurrentSite((prev) => (prev ? { ...prev, ...updates } : prev))
    }
  }

  const selectSite = (siteId: string) => {
    const site = sites.find((s) => s.id === siteId)
    if (site) setCurrentSite(site)
  }

  return (
    <SiteContext.Provider
      value={{ sites, currentSite, addSite, removeSite, updateSite, selectSite }}
    >
      {children}
    </SiteContext.Provider>
  )
}

export function useSites() {
  const context = useContext(SiteContext)
  if (!context) {
    throw new Error('useSites must be used within a SiteProvider')
  }
  return context
}
