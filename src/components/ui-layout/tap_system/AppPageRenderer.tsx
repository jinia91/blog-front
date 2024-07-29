import React from 'react'
import { useTabs } from '@/system/application/usecase/TabUseCases'
import { usePathname } from 'next/navigation'
import MemoFolderContainer from '@/components/memo/MemoFolderContainer'

export function RenderApp ({ page }: {
  page: React.ReactNode
}): React.ReactElement | null {
  const { tabs } = useTabs()
  const path = usePathname()

  function isEmpty (): boolean {
    return tabs.length === 0 || (path === '/empty')
  }

  function renderOthers (): React.ReactElement | null {
    return (
      <div className="bg-gray-700 p-4 rounded-b-lg overflow-auto">
        {page}
      </div>
    )
  }

  function isMemo (): boolean {
    return tabs.length > 0 && (path !== '/empty') && path.startsWith('/memo')
  }

  function renderMemo (): React.ReactElement | null {
    return (
      <div className="bg-gray-700 p-4 rounded-b-lg overflow-auto">
        <MemoFolderContainer>
          {page}
        </MemoFolderContainer>
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
