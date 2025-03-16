import React from 'react'
import LatestSection from './(components)/latest-section'
import AsideSection from './(components)/aside-section'

export default function Blog (): React.ReactElement {
  return (
    <div className=" justify-center items-center">
      <main className="flex bg-gray-900 text-gray-300 border-2 border-green-400"
            style={{
              maxHeight: 'calc(100vh - 180px)'
            }}>
        <div className="flex-grow overflow-y-auto">
          <LatestSection/>
        </div>
        <aside className="hidden sm:block sm:w-64 p-2 border-l border-green-400 bg-gray-800">
          <AsideSection/>
        </aside>
      </main>
    </div>
  )
}
