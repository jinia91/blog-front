import MemoEditor from '@/components/memo/memo_editor/MemoEditor'
import React from 'react'

export default async function Page ({ params }: { params: { id: string } }): Promise<React.ReactElement> {
  return (
    <main>
      <MemoEditor pageMemoNumber={params.id}/>
    </main>
  )
}
