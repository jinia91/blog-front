import React from 'react'

export default function Loading (): React.ReactElement {
  return (
    <div
      className="text-gray-300 bg-gray-900 border-2 border-green-400 h-[calc(100vh-180px)] flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400"/>
      <p className="ml-4 text-xl">로딩 중...</p>
    </div>
  )
}
