import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { type Tab } from '@/components/ui-layout/tap_system/TabItem'

const restoreTabsFromLocalStorage = (path: string): any => {
  const savedTabs = localStorage.getItem('tabs')
  const tabsList = (savedTabs != null) ? JSON.parse(savedTabs) : null
  if (path.startsWith('/login/oauth2')) {
    if (tabsList == null || tabsList.length === 0) {
      return [{ name: '/', context: '/' }]
    } else {
      return tabsList
    }
  }
  if (tabsList == null || (tabsList.length === 0 && path !== '/empty')) {
    return path === '/empty' ? [] : [{ name: path, context: path }]
  }
  if ((tabsList.length === 0 && path === '/empty') || (tabsList.length !== 0 && path === '/empty')) {
    return []
  }
  return tabsList
}

export function useTabs (initialPath: string): {
  tabs: Tab[]
  setTabs: React.Dispatch<React.SetStateAction<Tab[]>>
  selectTab: (index: number) => void
  selectedTabIdx: number
  setSelectedTabIdx: React.Dispatch<React.SetStateAction<number>>
  removeTab: (target: number) => void
} {
  const [tabs, setTabs] = useState<Tab[]>(() => restoreTabsFromLocalStorage(initialPath))
  const [selectedTabIdx, setSelectedTabIdx] = useState(() => {
    const index = tabs.findIndex((tab: Tab) => tab.context === initialPath)
    return index >= 0 ? index : 0
  })
  const selectTab = (index: number): void => {
    setSelectedTabIdx(index)
  }
  const removeTab = (target: number): void => {
    const newTabs = tabs.filter((_, idx) => idx !== target)
    setTabs(newTabs)
    setSelectedTabIdx(prevSelectedIdx => {
      if (prevSelectedIdx === target) {
        if (target === tabs.length - 1) {
          return Math.max(0, tabs.length - 2)
        }
        return target
      }
      return prevSelectedIdx > target ? prevSelectedIdx - 1 : prevSelectedIdx
    })
  }

  const updateLocalStorage = useCallback(() => {
    localStorage.setItem('tabs', JSON.stringify(tabs))
    localStorage.setItem('selectedTabIdx', String(selectedTabIdx))
  }, [tabs, selectedTabIdx])

  useEffect(() => {
    updateLocalStorage()
  }, [tabs, selectedTabIdx, updateLocalStorage])

  return { tabs, setTabs, selectTab, selectedTabIdx, setSelectedTabIdx, removeTab }
}
