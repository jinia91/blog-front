import MemoGraph from '@/components/memo/memo_graph/MemoGraph'
import React from 'react'
import MemoFolderContainer from '@/components/memo/MemoFolderContainer'

export default async function Page (): Promise<React.ReactElement> {
  return (
    <MemoFolderContainer>
      <main className="mb-4 flex-grow">
        <MemoGraph className={''}/>
      </main>
    </MemoFolderContainer>
  )
}
