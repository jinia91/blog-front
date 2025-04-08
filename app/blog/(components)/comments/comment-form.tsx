import React, { useRef, useState } from 'react'
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
  const [loading, setLoading] = useState(false)

  const onClick = async (): Promise<void> => {
    const nickname = nicknameRef.current?.value ?? ''
    const password = passwordRef.current?.value ?? ''
    const content = contentRef.current?.value ?? ''

    setLoading(true)
    try {
      await addComment(articleId, parentId, nickname, password, content)
      if (nicknameRef.current != null) nicknameRef.current.value = ''
      if (passwordRef.current != null) passwordRef.current.value = ''
      if (contentRef.current != null) contentRef.current.value = ''
      if (parentId !== null) {
        setSubmitted(true)
      }
    } catch (e) {
      alert(`❗ ${'알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'}`)
    } finally {
      setLoading(false)
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
            void onClick()
          }}
          disabled={loading}
          className="px-3 py-1 bg-green-700 text-white text-sm rounded hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '등록 중...' : '등록'}
        </button>
      </div>
    </div>
  )
}
