import MemoEditor from '@/components/memo/memo_editor/MemoEditor'
import React from 'react'
import MemoFolderContainer from '@/components/memo/MemoFolderContainer'

export default async function Page ({ params }: { params: { id: string } }): Promise<React.ReactElement> {
  return (
    <MemoFolderContainer>
      <main className={'flex-grow'}>
        <MemoEditor pageMemoNumber={params.id}/>
      </main>
    </MemoFolderContainer>
  )
}
