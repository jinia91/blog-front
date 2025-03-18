'use client'
import React from 'react'
import { usePathname } from 'next/navigation'
import MemoSystemMain from '../../../memo/(components)/memo-system-main'

export function RenderApp ({ page }: {
  page: React.ReactNode
}): React.ReactElement | null {
  const path = usePathname()

  function isEmpty (): boolean {
    return (path === '/empty')
  }

  function renderOthers (): React.ReactElement | null {
    return (
      <div className="bg-gray-700 sm:p-2 rounded-b-lg overflow-auto pt-2">
        {page}
      </div>
    )
  }

  function isMemo (): boolean {
    return (path !== '/empty') && path.startsWith('/memo')
  }

  function renderMemo (): React.ReactElement | null {
    return (
      <div className="bg-gray-700 p-4 rounded-b-lg overflow-auto">
        <MemoSystemMain>
          {page}
        </MemoSystemMain>
      </div>
    )
  }

  if (isMemo()) {
    return renderMemo()
  } else if (isEmpty()) {
    return null
  } else {
    return renderOthers()
  }
}
