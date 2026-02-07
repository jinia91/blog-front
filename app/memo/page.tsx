import MemoMainView from './(components)/memo-main-view'
import React from 'react'

export default async function Page (): Promise<React.ReactElement> {
  return (
    <main className="mb-4 flex-grow">
      <MemoMainView/>
    </main>
  )
}
