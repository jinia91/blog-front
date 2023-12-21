import MemoFolderContainer from '@/components/memo/MemoFolderContainer'
import React from 'react'

export function renderPage (
  tabs: any,
  path: string,
  page: React.ReactNode
): React.ReactNode {
  console.log('renderPage', tabs)
  console.log('renderPage', path)
  console.log('renderPage', page)

  function renderMemoContainer (): React.ReactNode {
    return (
      <div className="bg-gray-700 p-4 rounded-b-lg overflow-auto">
        <MemoFolderContainer>
          {page}
        </MemoFolderContainer>
      </div>
    )
  }

  function renderOthers (): React.ReactNode {
    return tabs.length > 0 && (path !== '/empty') && (
      <div className="bg-gray-700 p-4 rounded-b-lg">
        {page}
      </div>
    )
  }

  if (tabs.length > 0 && (path !== '/empty') && path.startsWith('/memo')) {
    return renderMemoContainer()
  } else if (tabs.length > 0 && (path !== '/empty')) {
    return renderOthers()
  } else {
    return null
  }
}
