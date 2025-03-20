import React from 'react'

export default function NotFoundPage (): React.ReactElement {
  return (
    <div className="p-4 text-gray-300 bg-gray-900 border-2 border-red-400 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-red-400">404 - Not Found</h1>
      <p className="mt-2 text-gray-400">페이지가 존재하지 않습니다</p>
    </div>
  )
}
