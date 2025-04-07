'use client'
import React from 'react'
import { useSession } from '../../../login/(usecase)/session-usecases'
import SignInPage from '../../../login/(components)/sign-in-page'
import ForbiddenPage from '../../../error/403'
import dynamic from 'next/dynamic'

const ArticleEditorMain = dynamic(async () => await import('../../(components)/article-editor/article-editor-main'), { ssr: false })

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
            maxHeight: 'calc(100vh - 200px)'
          }}>
      <ArticleEditorMain articleId={params.id}/>
    </main>
  )
}
