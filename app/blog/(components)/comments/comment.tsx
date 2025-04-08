'use client'

import React, { useEffect, useRef, useState } from 'react'
import { type Comment } from '../../(domain)/comment'
import { fetchComments } from '../../(infra)/comment'
import { useComments } from '../../(usecase)/comment-use-cases'

export const CommentForm = (
  {
    articleId,
    parentId
  }: { articleId: number, parentId: number | null }
): React.ReactElement | null => {
  const nicknameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const { addComment } = useComments()
  const [submitted, setSubmitted] = useState(false)

  const onClick = (): void => {
    const nickname = nicknameRef.current?.value ?? ''
    const password = passwordRef.current?.value ?? ''
    const content = contentRef.current?.value ?? ''
    void addComment(articleId, parentId, nickname, password, content)
    if (nicknameRef.current != null) nicknameRef.current.value = ''
    if (passwordRef.current != null) passwordRef.current.value = ''
    if (contentRef.current != null) contentRef.current.value = ''

    if (parentId !== null) {
      setSubmitted(true) // 답글일 때만 닫히게 처리
    }
  }

  if (submitted) return null

  return (
    <div className="space-y-2 mt-2">
      <div className="flex flex-row flex-wrap gap-2 w-full">
        <input ref={nicknameRef} placeholder="이름"
               className="flex-1 min-w-[120px] px-2 py-1 bg-black border border-green-700 text-green-300 text-sm"/>
        <input ref={passwordRef} placeholder="비밀번호" type="password"
               className="flex-1 min-w-[120px] px-2 py-1 bg-black border border-green-700 text-green-300 text-sm"/>
      </div>
      <textarea ref={contentRef} placeholder="> 댓글을 남겨주세요..."
                className="w-full h-20 p-2 bg-black border border-green-700 text-green-300 text-sm"/>
      <div className="flex justify-end">
        <button
          onClick={() => {
            if (nicknameRef.current == null || passwordRef.current == null || contentRef.current == null) return
            onClick()
          }}
          className="px-3 py-1 bg-green-700 text-white text-sm rounded hover:bg-green-500"
        >
          등록
        </button>
      </div>
    </div>
  )
}

export const CommentItem = ({
  comment,
  articleId,
  depth = 0
}: {
  comment: Comment
  articleId: number
  depth?: number
}): React.ReactElement => {
  const [showReplyForm, setShowReplyForm] = useState(false)

  return (
    <div
      className={`${depth > 0 ? 'ml-4 border-l border-green-800 pl-2' : ''} mt-2 p-2 bg-gray-900 border border-gray-700 rounded`}>
      <div className="text-green-300 text-sm">{comment.nickname} - <span
        className="text-xs text-gray-400">{comment.createdAt.toLocaleString()}</span></div>
      <div className="text-gray-300 text-sm whitespace-pre-line">{comment.content}</div>
      {depth < 2 && (
        <button
          onClick={() => {
            setShowReplyForm(!showReplyForm)
          }}
          className="text-xs text-green-500 mt-1 hover:underline"
        >
          답글
        </button>
      )}
      {showReplyForm && (
        <CommentForm
          parentId={comment.id}
          articleId={articleId}
        />
      )}
      {comment.children.map(child => (
        <CommentItem key={child.id} comment={child} articleId={articleId} depth={depth + 1}/>
      ))}
    </div>
  )
}

export default function CommentSection ({ articleId }: { articleId: number }): React.ReactElement {
  const { comments, setComments } = useComments()

  useEffect(() => {
    void fetchComments(articleId).then(setComments)
  }, [articleId])

  return (
    <div className="mt-10 border border-green-400 p-4 bg-gray-950 rounded text-gray-300">
      <h2 className="text-green-400 text-xl mb-2 font-mono">[ 댓글 ]</h2>
      <div className="space-y-4">
        {comments.map(comment => (
          <CommentItem key={comment.id} comment={comment} articleId={articleId} depth={0}/>
        ))}
      </div>
      <div className="mt-6">
        <CommentForm
          articleId={articleId}
          parentId={null}
        />
      </div>
    </div>
  )
}
