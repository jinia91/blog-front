import React from 'react'
import { AuthSessionContext } from '@/auth/adapter/provider/AuthSessionProvider'
import SignInPage from '@/auth/components/SignInPage'
import { type Session } from '@/auth/application/domain/Session'
import AdminAccessDenied from '@/auth/components/AccessDeniedPage'
import MemoFolderContainer from '@/components/memo/MemoFolderContainer'

export function RenderPage ({ tabs, path, page }: {
  tabs: any
  path: string
  page: React.ReactNode
}): React.ReactElement | null {
  const { session }: { session: Session } = React.useContext(AuthSessionContext)

  function renderMemoContainer (): React.ReactElement {
    if (session == null) {
      return (
        <div className="bg-gray-700 p-4 rounded-b-lg overflow-auto">
          <SignInPage/>
        </div>
      )
    } else if (session?.roles.values().next().value !== 'ADMIN') {
      return (
        <div className="bg-gray-700 p-4 rounded-b-lg overflow-auto">
          <AdminAccessDenied/>
        </div>
      )
    } else {
      return (
        <div className="bg-gray-700 p-4 rounded-b-lg overflow-auto">
          <MemoFolderContainer>
            {page}
          </MemoFolderContainer>
        </div>
      )
    }
  }

  function renderOthers (): React.ReactElement | null {
    return (
      <div className="bg-gray-700 p-4 rounded-b-lg overflow-auto">
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
