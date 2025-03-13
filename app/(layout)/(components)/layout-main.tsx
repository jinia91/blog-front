'use client'
import TabContextMenu from './(tap-system)/tab-context-menu'
import { RenderApp } from './(tap-system)/app-page-renderer'
import TopNavMain from './(topbar)/top-nav-main'
import SideAppBar from './(sidebar)/side-bar-main'
import React from 'react'
import { TapBarMain } from './(tap-system)/tap-bar-main'

const LayoutMain = ({ page }: { page: React.ReactNode }): React.ReactNode => {
  return (
    <>
      <header className="w-full dark:bg-gray-900 border-b"><TopNavMain/></header>
      <div className="md:flex overflow-hidden">
        <aside className="fixed md:static flex-1 h-screen bg-white dark:bg-gray-900 md:border-r"
               style={{ zIndex: 100 }}
        >
          <SideAppBar/>
        </aside>
        <main
          className="p-1 flex-grow bg-white dark:bg-gray-800 text-black dark:text-white w-screen overflow-hidden pb-4"
          style={{ height: 'calc(100vh - 60px)' }}>
          <TabContextMenu/>
          <div className="bg-gray-800 p-4">
            <TapBarMain/>
            <RenderApp page={page}/>
          </div>
        </main>
      </div>
    </>
  )
}
export { LayoutMain }
