import React from 'react'
import ArticleEditorMain from '../../(components)/article-editor/article-editor-main'

export default async function Page ({ params }: { params: { id: string } }): Promise<React.ReactElement> {
  return (
    <main className={'flex-grow'}>
      <ArticleEditorMain pageMemoId={params.id}/>
    </main>
  )
}
