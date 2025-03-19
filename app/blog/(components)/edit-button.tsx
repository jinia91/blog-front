'use client'

import React from 'react'
import { useSession } from '../../login/(usecase)/session-usecases'
import { useRouter } from 'next/navigation'

export default function EditButton (
  { articleId }: { articleId: string }
): React.JSX.Element | null {
  const { session } = useSession()
  const router = useRouter()

  return session?.roles.values().next().value === 'ADMIN'
    ? (
      <button
        className="p-2 bg-green-400 text-white font-bold rounded-md hover:bg-green-500 transition-colors duration-200"
        onClick={() => {
          router.push('/blog/edit/' + articleId)
        }}
      >
        수정 하기
      </button>
      )
    : null
}
