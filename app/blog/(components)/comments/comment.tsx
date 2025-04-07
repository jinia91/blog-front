'use client'

import React, { useEffect, useRef, useState } from 'react'

interface Comment {
  id: number
  content: string
  nickname: string
  time: string
  children: Comment[]
}

async function fetchComments (articleId: number): Promise<Comment[]> {
  // Replace with real API
  return await Promise.resolve([
    {
      id: 1,
      content: '최상위 댓글입니다.',
      nickname: '익명1',
      time: '2025-04-07 15:00',
      children: [
        {
          id: 2,
          content: '답글입니다.',
          nickname: '익명2',
          time: '2025-04-07 15:01',
          children: []
        }
      ]
    }
  ])
}

async function postComment (articleId: number, parentId: number | null, nickname: string, password: string, content: string): Promise<Comment> {
  return await Promise.resolve({
    id: Math.floor(Math.random() * 10000),
    content,
    nickname,
    time: new Date().toISOString(),
    children: []
  })
}

function CommentForm ({
  onSubmit
}: {
  onSubmit: (nickname: string, password: string, content: string) => void
}) {
  const nicknameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  return (
    <div className="space-y-2 mt-2">
      <div className="flex space-x-2">
        <input ref={nicknameRef} placeholder="이름"
               className="flex-1 px-2 py-1 bg-black border border-green-700 text-green-300 text-sm"/>
        <input ref={passwordRef} placeholder="비밀번호" type="password"
               className="flex-1 px-2 py-1 bg-black border border-green-700 text-green-300 text-sm"/>
      </div>
      <textarea ref={contentRef} placeholder="> 여기에 입력하세요..."
                className="w-full h-20 p-2 bg-black border border-green-700 text-green-300 text-sm"/>
      <div className="flex justify-end">
        <button
          onClick={() => {
            const nickname = nicknameRef.current?.value || ''
            const password = passwordRef.current?.value || ''
            const content = contentRef.current?.value || ''
            if (nickname && password && content) {
              onSubmit(nickname, password, content)
              nicknameRef.current!.value = ''
              passwordRef.current!.value = ''
              contentRef.current!.value = ''
            }
          }}
          className="px-3 py-1 bg-green-700 text-white text-sm rounded hover:bg-green-500"
        >
          등록
        </button>
      </div>
    </div>
  )
}

function CommentItem ({
  comment,
  articleId,
  onReply
}: {
  comment: Comment
  articleId: number
  onReply: (parentId: number, reply: Comment) => void
}) {
  const [showReplyForm, setShowReplyForm] = useState(false)

  return (
    <div className="ml-4 mt-4 border-l border-green-800 pl-4">
      <div className="text-green-300 text-sm">{comment.nickname} - <span
        className="text-xs text-gray-400">{comment.time}</span></div>
      <div className="text-gray-300 text-sm">{comment.content}</div>
      <button onClick={() => { setShowReplyForm(!showReplyForm) }}
              className="text-xs text-green-500 mt-1 hover:underline">답글
      </button>
      {showReplyForm && (
        <CommentForm
          onSubmit={async (nickname, password, content) => {
            const reply = await postComment(articleId, comment.id, nickname, password, content)
            onReply(comment.id, reply)
            setShowReplyForm(false)
          }}
        />
      )}
      {comment.children.map(child => (
        <CommentItem key={child.id} comment={child} articleId={articleId} onReply={onReply}/>
      ))}
    </div>
  )
}

export default function CommentSection (): React.ReactElement {
  const articleId = 1 // assuming articleId is known
  const [comments, setComments] = useState<Comment[]>([])

  useEffect(() => {
    fetchComments(articleId).then(setComments)
  }, [articleId])

  const addComment = (newComment: Comment) => {
    setComments(prev => [...prev, newComment])
  }

  const addReply = (parentId: number, reply: Comment) => {
    const appendReply = (nodes: Comment[]): Comment[] =>
      nodes.map(node =>
        node.id === parentId
          ? { ...node, children: [...node.children, reply] }
          : { ...node, children: appendReply(node.children) }
      )
    setComments(prev => appendReply(prev))
  }

  return (
    <div className="mt-10 border border-green-400 p-4 bg-gray-950 rounded text-gray-300">
      <h2 className="text-green-400 text-xl mb-4 font-mono">[ 댓글 ]</h2>
      <div className="space-y-4">
        {comments.map(comment => (
          <CommentItem key={comment.id} comment={comment} articleId={articleId} onReply={addReply}/>
        ))}
      </div>
      <div className="mt-6">
        <CommentForm
          onSubmit={async (nickname, password, content) => {
            const newComment = await postComment(articleId, null, nickname, password, content)
            addComment(newComment)
          }}
        />
      </div>
    </div>
  )
}
