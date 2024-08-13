import MemoGraph from './(components)/memo-graph/memo-graph'
import React from 'react'

export default async function Page (): Promise<React.ReactElement> {
  return (
    <main className="mb-4 flex-grow">
      <MemoGraph/>
    </main>
  )
}
