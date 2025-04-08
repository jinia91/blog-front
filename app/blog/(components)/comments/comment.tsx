import type { Comment } from '../../(domain)/comment'
import React, { useState } from 'react'
import { CommentForm } from './comment-form'
import { useSession } from '../../../login/(usecase)/session-usecases'
import { useComments } from '../../(usecase)/comment-use-cases'

export const CommentItem = ({
  comment,
  articleId,
  depth = 0
}: {
  comment: Comment
  articleId: number
  depth?: number
}): React.ReactElement | null => {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const isAnonymous = comment.authorId == null
  const { session } = useSession()
  const isOwner = session != null && comment.authorId === session.userId
  const { removeComment } = useComments()

  if (comment.deleted && comment.children.length === 0) {
    return null
  }

  return (
    <div
      className={`relative ${depth > 0 ? 'ml-4 border-l border-green-800 pl-2' : ''} mt-2 p-2 bg-gray-900 border border-gray-700 rounded`}>
      {!comment.deleted && (
        <div className="text-green-300 text-sm flex items-center gap-2 mb-2">
          <span
            className="w-5 h-5 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center text-white text-xs">
            {(comment.profileImageUrl != null)
              ? (<img src={comment.profileImageUrl} alt="profile" className="w-full h-full object-cover"/>)
              : ('?')}
          </span>
          {comment.nickname} - <span className="text-xs text-gray-400">
            <span className="hidden sm:inline">{new Date(comment.createdAt).toLocaleString()}</span>
            <span className="inline sm:hidden">{new Date(comment.createdAt).toLocaleDateString()}</span>
          </span>
        </div>
      )}
      <div className="text-gray-300 text-sm whitespace-pre-line">
        {comment.deleted ? '삭제된 댓글입니다' : comment.content}
      </div>
      {!comment.deleted && (
        <>
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
          {(isAnonymous || isOwner) && (
            <div className="absolute top-2 right-2">
              <button
                className="text-xs text-red-400 hover:underline"
                onClick={() => {
                  setShowDeleteConfirm(true)
                }}
              >
                삭제
              </button>
            </div>
          )}
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-gray-800 p-4 rounded shadow-lg w-80 text-sm">
                <p className="text-white mb-2">정말 삭제하시겠습니까?</p>
                {isAnonymous && (
                  <>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                      }}
                      placeholder="비밀번호 입력"
                      className="w-full bg-gray-700 text-white p-2 mb-2 border border-gray-600 rounded"
                    />
                    {(passwordError !== '') && (
                      <p className="text-red-400 text-xs mb-2">{passwordError}</p>
                    )}
                  </>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false)
                    }}
                    className="px-3 py-1 bg-gray-600 text-white rounded"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => {
                      if (isAnonymous && password.trim() === '') {
                        setPasswordError('비밀번호를 입력해주세요.')
                        return
                      }
                      void removeComment(comment.id, isAnonymous ? password : null)
                      setShowDeleteConfirm(false)
                      setPasswordError('')
                    }}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {comment.children.map(child => (
        <CommentItem key={child.id} comment={child} articleId={articleId} depth={depth + 1}/>
      ))}
    </div>
  )
}
