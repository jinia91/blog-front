import TabContextMenu from './(tap-system)/tab-context-menu'
import { RenderApp } from './(tap-system)/app-page-renderer'
import TopNavMain from './(topbar)/top-nav-main'
import SideAppBar from './(sidebar)/side-bar-main'
import React from 'react'
import { TapBarMain } from './(tap-system)/tap-bar-main'

const LayoutMain = ({ page }: { page: React.ReactNode }): React.ReactNode => {
  return (
    <main className="h-screen flex flex-col">
      <header className="w-full bg-gray-900 border-b"><TopNavMain/></header>
      <div className="md:flex flex-grow overflow-hidden">
        <aside className="fixed md:static flex-1 bg-gray-900 md:border-r"
               style={{ zIndex: 100 }}
        >
          <SideAppBar/>
        </aside>
        <div className="flex-grow bg-gray-800 text-white w-screen overflow-hidden pb-4">
          <TabContextMenu/>
          <div className="flex flex-col h-full">
            <div className="bg-gray-800 pt-4 flex-shrink-0">
              <TapBarMain/>
            </div>
            <div className="flex-grow overflow-auto">
              <RenderApp page={page}/>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
export { LayoutMain }
