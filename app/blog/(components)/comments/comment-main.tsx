'use client'

import React, { useEffect } from 'react'
import { fetchComments } from '../../(infra)/comment'
import { useComments } from '../../(usecase)/comment-use-cases'
import { CommentForm } from './comment-form'
import { CommentItem } from './comment'

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
