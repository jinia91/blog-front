import React from 'react'
import ArticleEditorMain from '../../(components)/article-editor/article-editor-main'

export default async function Page ({ params }: { params: { id: string } }): Promise<React.ReactElement> {
  return (
    <main className={'bg-gray-900 text-gray-300 border-green-400 p-4 border-2 overflow-y-scroll'}
          style={{
            maxHeight: 'calc(100vh - 180px)'
          }}>
      <ArticleEditorMain pageMemoId={params.id}/>
    </main>
  )
}
