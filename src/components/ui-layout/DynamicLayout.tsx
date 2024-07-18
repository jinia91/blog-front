'use client'
import React, { createContext, useCallback, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { type Tab } from '@/components/ui-layout/tapbar/TabItem'
import renderContextMenu, { type TabContextMenuProps } from '@/components/ui-layout/tapbar/TabContextMenu'
import { TabContainer } from '@/components/ui-layout/tapbar/TabBarContainer'
import { RenderPage } from '@/components/ui-layout/AppPageRenderer'
import TopNav from '@/components/ui-layout/top/TopNav'
import Sidebar from '@/components/ui-layout/sidebar/SideBar'

const initialTabStatus = {
  tabs: [],
  selectedTabIdx: 0,
  setTabs: () => {
  },
  setSelectedTabIdx: () => {
  }
}

const TabBarContext: React.Context<any> = createContext(initialTabStatus)
const DynamicLayout = ({ page }: { page: React.ReactNode }): React.ReactNode => {
  const path = usePathname()
  const router = useRouter()
  const restoreTabs = (): any => {
    const savedTabs = localStorage.getItem('tabs')
    const parsedTabs = (savedTabs != null) ? JSON.parse(savedTabs) : null

    if (path.startsWith('/login/oauth2')) {
      if (parsedTabs == null || parsedTabs.length === 0) {
        return [{ name: '/', context: '/' }]
      } else {
        return parsedTabs
      }
    }

    if (parsedTabs == null || (parsedTabs.length === 0 && path !== '/empty')) {
      return path === '/empty' ? [] : [{ name: path, context: path }]
    }

    if ((parsedTabs.length === 0 && path === '/empty') || (parsedTabs.length !== 0 && path === '/empty')) {
      return []
    }

    return parsedTabs
  }

  const [tabs, setTabs] = useState<Tab[]>(restoreTabs)
  const [selectedTabIdx, setSelectedTabIdx] = useState<number>(() => {
    const savedTabs = restoreTabs()
    const savedIndex = savedTabs.findIndex((tab: Tab) => tab.context === path)
    return savedIndex >= 0 ? savedIndex : savedTabs.length
  })

  useEffect(() => {
    const existingTabIndex = tabs.findIndex((tab: Tab) => tab.context === path)

    if (existingTabIndex === -1 && path === '/empty') {
      return
    } else if (existingTabIndex === -1 && path !== '/empty' && !path.startsWith('/login/oauth2')) { // 탭 렌더링 안할 항목들, todo 함수로 따로 빼자
      const newTab = { name: path, context: path }
      const newTabs = [...tabs, newTab]
      setTabs(newTabs)
      setSelectedTabIdx(newTabs.length - 1)
    } else {
      setSelectedTabIdx(existingTabIndex)
    }

    localStorage.setItem('tabs', JSON.stringify(tabs))
    localStorage.setItem('selectedTabIdx', selectedTabIdx.toString())
  }, [path])

  useEffect(() => {
    const selectedTab = tabs[selectedTabIdx]
    if (selectedTab != null && selectedTab.context !== path) {
      router.push(selectedTab.context)
    } else if (tabs.length === 0) {
      router.push('/empty')
      localStorage.setItem('tabs', JSON.stringify(tabs))
      localStorage.setItem('selectedTabIdx', '0')
      return
    }

    localStorage.setItem('tabs', JSON.stringify(tabs))
    localStorage.setItem('selectedTabIdx', selectedTabIdx.toString())
  }, [selectedTabIdx, tabs])

  const selectTab = (index: number): void => {
    setSelectedTabIdx(index)
  }

  const removeTab = (target: number): void => {
    const newTabs = tabs.filter((_, idx) => idx !== target)
    setTabs(newTabs)
    setSelectedTabIdx(prevIdx => {
      if (prevIdx === target) {
        if (target === tabs.length - 1) {
          return Math.max(0, tabs.length - 2)
        }
        return target
      }
      return prevIdx > target ? prevIdx - 1 : prevIdx
    })
  }

  const [contextMenu, setContextMenu] = useState<TabContextMenuProps | null>(null)

  const closeContextMenu = useCallback(() => {
    setContextMenu(null)
  }, [])

  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement>, idx: number) => {
    event.preventDefault()
    setContextMenu({
      xPos: `${event.pageX}px`,
      yPos: `${event.pageY}px`,
      tabIdx: idx
    })
  }, [])

  const closeAllTabs = useCallback(() => {
    setTabs([])
  }, [setTabs])

  const closeOtherTabs = useCallback(() => {
    if (contextMenu !== null) {
      setTabs(tabs.filter((_, idx) => idx === contextMenu.tabIdx))
      setSelectedTabIdx(0)
    }
  }, [tabs, contextMenu, setTabs])

  const removeTabCallback = useCallback(() => {
    if (contextMenu !== null) {
      removeTab(contextMenu.tabIdx)
    }
  }, [contextMenu])

  useEffect(() => {
    document.addEventListener('click', closeContextMenu)
    return () => {
      document.removeEventListener('click', closeContextMenu)
    }
  }, [closeContextMenu])

  return (
    <TabBarContext.Provider value={{ tabs, selectedTabIdx, setTabs, setSelectedTabIdx }}>
      <header className="sticky top-0 w-full dark:bg-gray-900 border-b"><TopNav/></header>
      <div className="md:flex overflow-hidden">
        <aside className="fixed md:static flex-1 h-screen bg-white dark:bg-gray-900 md:border-r"
               style={{ zIndex: 100 }}
        >
          <Sidebar/>
        </aside>
        <main
          className="p-1 flex-grow bg-white dark:bg-gray-800 text-black dark:text-white w-screen md:h-screen min-h-screen overflow-auto">
          {renderContextMenu(contextMenu, closeContextMenu, removeTabCallback, closeOtherTabs, closeAllTabs)}
          <div className="bg-gray-800 p-4">
            <TabContainer
              onSelectTab={selectTab}
              onRemoveTab={removeTab}
              onContextMenu={handleContextMenu}
            />
            <RenderPage tabs={tabs} path={path} page={page}/>
          </div>
        </main>
      </div>
    </TabBarContext.Provider>
  )
}
export { TabBarContext, DynamicLayout }
