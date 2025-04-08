import React from 'react'
import MainSection from './(components)/main-section'
import AsideSection from './(components)/aside/aside-section'

export interface ArticleSearchParam {
  searchParams: {
    mode?: string
    tag?: string
    keyword?: string
  }
}

export default function Blog ({ searchParams }: ArticleSearchParam): React.ReactElement {
  const isPublishMode = (searchParams.mode == null) || searchParams.mode === 'publish'

  return (
    <div className=" justify-center items-center">
      <main className="flex bg-gray-900 text-gray-300 border-2 border-green-400"
            style={{
              maxHeight: 'calc(100vh - 200px)',
              minHeight: 'calc(100vh - 200px)'
            }}>
        <div className="flex-grow overflow-y-auto">
          <MainSection searchParams={searchParams}/>
        </div>
        <aside className="hidden sm:block sm:w-64 p-2 border-l border-green-400 bg-gray-800 min-w-[250px]">
          <AsideSection isPublishMode={isPublishMode}/>
        </aside>
      </main>
    </div>
  )
}
