'use client'
import React, { createContext, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import renderContextMenu from '@/components/ui-layout/tap_system/TabContextMenu'
import { TabBar } from '@/components/ui-layout/tap_system/TabBar'
import { RenderPage } from '@/components/ui-layout/tap_system/AppPageRenderer'
import TopNav from '@/components/system/top/TopNav'
import SideAppBar from '@/components/system/sidebar/SideBar'
import { useTabs } from '@/system/application/usecase/TabUseCases'
import { useContextMenu } from '@/system/application/usecase/useContextMenu'

const initialTabStatus = {
  tabs: [],
  selectedTabIdx: 0,
  setTabs: () => {
  },
  setSelectedTabIdx: () => {
  }
}

const TabBarContext: React.Context<any> = createContext(initialTabStatus)
const TapRouteMain = ({ page }: { page: React.ReactNode }): React.ReactNode => {
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
  }, [path, selectedTabIdx, tabs])

  return (
    <TabBarContext.Provider value={{ tabs, selectedTabIdx, setTabs, setSelectedTabIdx }}>
      <header className="sticky top-0 w-full dark:bg-gray-900 border-b"><TopNav/></header>
      <div className="md:flex overflow-hidden">
        <aside className="fixed md:static flex-1 h-screen bg-white dark:bg-gray-900 md:border-r"
               style={{ zIndex: 100 }}
        >
          <SideAppBar/>
        </aside>
        <main
          className="p-1 flex-grow bg-white dark:bg-gray-800 text-black dark:text-white w-screen overflow-auto pb-4"
          style={{ height: 'calc(100vh - 60px)' }}>
          {renderContextMenu(contextMenu, closeContextMenu, removeTabCallback, closeOtherTabs, closeAllTabs)}
          <div className="bg-gray-800 p-4">
            <TabBar
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
export { TabBarContext, TapRouteMain }
