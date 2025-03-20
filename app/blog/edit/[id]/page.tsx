'use client'
import React from 'react'
import ArticleEditorMain from '../../(components)/article-editor/article-editor-main'
import { useSession } from '../../../login/(usecase)/session-usecases'
import SignInPage from '../../../login/(components)/sign-in-page'
import ForbiddenPage from '../../../error/403'

export default function Page ({ params }: { params: { id: string } }): React.ReactElement {
  const { session } = useSession()

  if (session === null) {
    return <SignInPage/>
  }

  if (session?.roles.values().next().value !== 'ADMIN') {
    return <ForbiddenPage/>
  }

  return (
    <main className={'bg-gray-900 text-gray-300 border-green-400 p-4 border-2 overflow-y-scroll'}
          style={{
            maxHeight: 'calc(100vh - 180px)'
          }}>
      <ArticleEditorMain articleId={params.id}/>
    </main>
  )
}
