'use client'
import React, { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import TabContextMenu from '@/components/ui-layout/tap_system/TabContextMenu'
import { TabBar } from '@/components/ui-layout/tap_system/TabBar'
import { RenderApp } from '@/components/ui-layout/tap_system/AppPageRenderer'
import TopNav from '@/components/system/top/TopNav'
import SideAppBar from '@/components/system/sidebar/SideBar'
import { useTabs } from '@/system/application/usecase/TabUseCases'

const TapMain = ({ page }: { page: React.ReactNode }): React.ReactNode => {
  const path = usePathname()
  const router = useRouter()
  const {
    tabs,
    selectedTabIdx
  } = useTabs()

  useEffect(() => {
    const routePage = (): void => {
      if (tabs.length === 0) {
        router.push('/empty')
        return
      }
      const selectedTab = tabs[selectedTabIdx]
      if (selectedTab?.urlPath !== path) {
        router.push(selectedTab.urlPath)
      }
    }
    routePage()
  }, [path, selectedTabIdx, tabs])

  return (
    <>
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
          {TabContextMenu()}
          <div className="bg-gray-800 p-4">
            <TabBar/>
            <RenderApp page={page}/>
          </div>
        </main>
      </div>
    </>
  )
}
export { TapMain }
