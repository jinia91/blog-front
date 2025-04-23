'use client'
import React, { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import MemoSystemMain from '../../../memo/(components)/memo-system-main'
import { Empty } from '../../../empty/(components)/empty'
import { router } from 'next/client'

export function RenderApp ({ page }: {
  page: React.ReactNode
}): React.ReactElement | null {
  const path = usePathname()
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      window.gtag('config', 'G-P4VL2DXGLB', {
        page_path: url
      })
    }

    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

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
    return (<Empty/>)
  } else {
    return renderOthers()
  }
}
