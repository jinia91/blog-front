'use client'
import TabContextMenu from '@/components/system/tap_system/TabContextMenu'
import { RenderApp } from '@/components/system/tap_system/AppPageRenderer'
import TopNav from '@/components/system/top/TopNav'
import SideAppBar from '@/components/system/sidebar/SideBar'
import React from 'react'
import { TapBarContainer } from '@/components/system/tap_system/TapBarContainer'

const SystemMain = ({ page }: { page: React.ReactNode }): React.ReactNode => {
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
            <TapBarContainer/>
            <RenderApp page={page}/>
          </div>
        </main>
      </div>
    </>
  )
}
export { SystemMain }
