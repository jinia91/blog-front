import MemoGraph from './(components)/memo_graph/memo-graph'
import React from 'react'

export default async function Page (): Promise<React.ReactElement> {
  console.log('memo page')
  return (
    <main className="mb-4 flex-grow">
      <MemoGraph/>
    </main>
  )
}
