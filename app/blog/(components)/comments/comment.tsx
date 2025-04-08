import type { Comment } from '../../(domain)/comment'
import React, { useState } from 'react'
import { CommentForm } from './comment-form'

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
