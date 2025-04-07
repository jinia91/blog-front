'use client'

import React, { useState } from 'react'

function getRandomColor () {
  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500']
  return colors[Math.floor(Math.random() * colors.length)]
}

const mockComments = [
  {
    id: 1,
    nickname: '익명1',
    time: '2025-04-07 14:23',
    content: '정말 멋진 글입니다! 잘 보고 갑니다.',
    profileUrl: ''
  },
  {
    id: 2,
    nickname: '익명2',
    time: '2025-04-07 14:25',
    content: '감사합니다. 좋은 하루 되세요!',
    profileUrl: ''
  }
]

export default function CommentSection (): React.ReactElement {
  const [text, setText] = useState('')
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [replyText, setReplyText] = useState('')
  const [showReply, setShowReply] = useState(false)
  const [replyNickname, setReplyNickname] = useState('')
  const [replyPassword, setReplyPassword] = useState('')
  const [avatarColor] = useState(getRandomColor())

  return (
    <div className="mt-10 border border-green-400 p-4 bg-gray-950 rounded shadow-inner text-gray-300">
      <h2 className="font-mono text-green-400 text-xl mb-4">[ 댓글 ]</h2>

      {/* 댓글 목록 */}
      <div className="space-y-4">
        {mockComments.map((comment) => (
          <div key={comment.id} className="relative border border-gray-700 p-3 rounded bg-gray-800">
            <div className="flex items-center space-x-2">
              <div
                className={`w-6 h-6 rounded-full ${getRandomColor()} flex items-center justify-center text-xs font-bold text-white`}>?
              </div>
              <p className="font-mono text-green-300 text-sm">{comment.nickname}</p>
              <p className="text-xs text-gray-400">{comment.time}</p>
            </div>
            <button className="absolute top-2 right-2 text-xs text-red-400 hover:underline">삭제</button>
            <p className="text-sm text-gray-300 mt-1">{comment.content}</p>
            <button
              onClick={() => {
                setShowReply(!showReply)
              }}
              className="text-xs text-green-400 mt-2 hover:underline"
            >
              답글
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${showReply ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="mt-2">
                <textarea
                  value={replyText}
                  onChange={(e) => {
                    setReplyText(e.target.value)
                  }}
                  placeholder="> 여기에 답글을 입력하세요..."
                  className="w-full h-20 p-2 bg-black border border-green-700 text-green-300 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <div className="flex space-x-2 mt-1">
                  <input
                    type="text"
                    value={replyNickname}
                    onChange={(e) => {
                      setReplyNickname(e.target.value)
                    }}
                    placeholder="이름"
                    className="flex-1 px-2 py-1 bg-black border border-green-700 text-green-300 font-mono text-sm"
                  />
                  <input
                    type="password"
                    value={replyPassword}
                    onChange={(e) => {
                      setReplyPassword(e.target.value)
                    }}
                    placeholder="비밀번호"
                    className="flex-1 px-2 py-1 bg-black border border-green-700 text-green-300 font-mono text-sm"
                  />
                  <button
                    onClick={() => {
                      console.log('답글:', replyText, replyNickname, replyPassword)
                      setReplyText('')
                      setReplyNickname('')
                      setReplyPassword('')
                      setShowReply(false)
                    }}
                    className="px-3 py-1 bg-green-700 text-gray-100 font-mono text-sm rounded hover:bg-green-500 transition-all duration-200"
                  >
                    등록
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 댓글 입력창 */}
      <div className="mt-6 space-y-2">
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value)
            }}
            placeholder="이름"
            className="min-w-0 flex-1 px-2 py-1 bg-black border border-green-700 text-green-300 font-mono text-sm"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
            }}
            placeholder="비밀번호"
            className="min-w-0 flex-1 px-2 py-1 bg-black border border-green-700 text-green-300 font-mono text-sm"
          />
        </div>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value)
          }}
          placeholder="> 여기에 댓글을 입력하세요..."
          className="w-full h-24 p-2 bg-black border border-green-700 text-green-300 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <div className="flex justify-end">
          <button
            className="px-4 py-1 bg-green-700 text-gray-100 font-mono text-sm rounded hover:bg-green-500 transition-all duration-200"
            onClick={() => {
              console.log('댓글:', text, nickname, password)
              setText('')
              setNickname('')
              setPassword('')
            }}
          >
            등록
          </button>
        </div>
      </div>
    </div>
  )
}
