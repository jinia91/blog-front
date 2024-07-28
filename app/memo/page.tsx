import MemoGraph from '@/components/memo/memo_graph/MemoGraph'
import React from 'react'

export default async function Page (): Promise<React.ReactElement> {
  console.log('memo page')
  return (
    <main className="mb-4 flex-grow">
      <MemoGraph/>
    </main>
  )
}
