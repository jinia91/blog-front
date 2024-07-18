'use client'
import React, { createContext, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import renderContextMenu from '@/components/ui-layout/tapbar/TabContextMenu'
import { TabContainer } from '@/components/ui-layout/tapbar/TabBarContainer'
import { RenderPage } from '@/components/ui-layout/AppPageRenderer'
import TopNav from '@/components/ui-layout/top/TopNav'
import Sidebar from '@/components/ui-layout/sidebar/SideBar'
import { useTabs } from '@/components/ui-layout/main/hook/useTabs'
import { useContextMenu } from '@/components/ui-layout/main/hook/useContextMenu'

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
  const {
    tabs,
    setTabs,
    selectTab,
    selectedTabIdx,
    setSelectedTabIdx,
    removeTab
  } = useTabs(path)
  const {
    contextMenu,
    closeContextMenu,
    handleContextMenu,
    closeAllTabs,
    closeOtherTabs,
    removeTabCallback
  } = useContextMenu({ setTabs, setSelectedTabIdx, removeTab })
  useEffect(() => {
    const routePage = (): void => {
      if (tabs.length === 0) {
        router.push('empty')
        return
      }
      const selectedTab = tabs[selectedTabIdx]
      if (selectedTab?.context !== path) {
        router.push(selectedTab.context)
      }
    }
    routePage()
  }, [path, selectedTabIdx, tabs, router])

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
