'use client'

import React, { useState } from 'react'

export default function CommentSection (): React.ReactElement {
  const [text, setText] = useState('')

  return (
    <div className="mt-10 border border-green-400 p-4 bg-gray-950 rounded shadow-inner text-gray-300">
      <h2 className="font-mono text-green-400 text-xl mb-4">[ 댓글 ]</h2>
      <div className="mb-4">
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value)
          }}
          placeholder="> 여기에 댓글을 입력하세요..."
          className="w-full h-24 p-2 bg-black border border-green-700 text-green-300 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>
      <div className="flex justify-end">
        <button
          className="px-4 py-1 bg-green-700 text-gray-100 font-mono text-sm rounded hover:bg-green-500 transition-all duration-200"
          onClick={() => {
            console.log('댓글:', text)
            setText('')
          }}
        >
          등록
        </button>
      </div>

      {/* 댓글 목록 (예시) */}
      <div className="mt-6 space-y-4">
        <div className="border border-gray-700 p-3 rounded bg-gray-800">
          <p className="font-mono text-green-300 text-sm">익명1:</p>
          <p className="text-sm text-gray-300 mt-1">정말 멋진 글입니다! 잘 보고 갑니다.</p>
        </div>
      </div>
    </div>
  )
}
