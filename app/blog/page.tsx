'use client'
import React from 'react'
import MainSection from './(components)/main-section'
import AsideSection from './(components)/aside/aside-section'
import { useSectionMode } from './(usecase)/section-toggle-usecases'
import DraftSection from './(components)/draft-section'

export default function Blog (): React.ReactElement {
  const { isPublishMode } = useSectionMode()
  return (
    <div className=" justify-center items-center">
      <main className="flex bg-gray-900 text-gray-300 border-2 border-green-400"
            style={{
              maxHeight: 'calc(100vh - 200px)'
            }}>
        <div className="flex-grow overflow-y-auto">
          {isPublishMode ? <MainSection/> : <DraftSection/>}
        </div>
        <aside className="hidden sm:block sm:w-64 p-2 border-l border-green-400 bg-gray-800 min-w-[250px]">
          <AsideSection/>
        </aside>
      </main>
    </div>
  )
}
