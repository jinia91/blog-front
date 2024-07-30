import React from 'react'
import { usePathname } from 'next/navigation'
import MemoFolderMain from '@/components/memo/MemoFolderMain'

export function RenderApp ({ page }: {
  page: React.ReactNode
}): React.ReactElement | null {
  const path = usePathname()
  console.log('RenderApp 렌더링 횟수 체크, path:', path)

  function isEmpty (): boolean {
    return (path === '/empty')
  }

  function renderOthers (): React.ReactElement | null {
    return (
      <div className="bg-gray-700 p-4 rounded-b-lg overflow-auto">
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
        <MemoFolderMain>
          {page}
        </MemoFolderMain>
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
