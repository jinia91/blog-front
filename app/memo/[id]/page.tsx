import MemoEditorMain from '../(components)/memo_editor/memo-editor-main'
import React from 'react'

export default async function Page ({ params }: { params: { id: string } }): Promise<React.ReactElement> {
  return (
    <main className={'flex-grow'}>
      <MemoEditorMain pageMemoId={params.id}/>
    </main>
  )
}
