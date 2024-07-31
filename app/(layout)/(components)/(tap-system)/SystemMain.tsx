'use client'
import TabContextMenu from './TabContextMenu'
import { RenderApp } from './AppPageRenderer'
import TopNav from '../(topbar)/TopNav'
import SideAppBar from '../(sidebar)/SideBar'
import React from 'react'
import { TapBarMain } from './TapBarMain'

const SystemMain = ({ page }: { page: React.ReactNode }): React.ReactNode => {
  console.log('SystemMain 렌더링 체크 1')
  return (
    <>
      <header className="w-full dark:bg-gray-900 border-b"><TopNav/></header>
      <div className="md:flex overflow-hidden">
        <aside className="fixed md:static flex-1 h-screen bg-white dark:bg-gray-900 md:border-r"
               style={{ zIndex: 100 }}
        >
          <SideAppBar/>
        </aside>
        <main
          className="p-1 flex-grow bg-white dark:bg-gray-800 text-black dark:text-white w-screen overflow-auto pb-4"
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
export { SystemMain }
