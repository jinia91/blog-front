import React from 'react'

export default function AsideSection (): React.ReactElement {
  return (
    <div className="border-1 border-b-green-400 h-full">
      <input
        type="text"
        placeholder="Search"
        className="w-full p-2 bg-gray-900 text-white border-1 border-green-400"
      />
    </div>
  )
}
