'use client'

import React from 'react'
import { useSession } from '../../login/(usecase)/session-usecases'

export default function DeleteButton (): React.JSX.Element | null {
  const { session } = useSession()
  return session?.roles.values().next().value === 'ADMIN'
    ? (
      <button
        className="p-2 bg-green-400 text-white font-bold rounded-md hover:bg-green-500 transition-colors duration-200"
      >
        삭제 하기
      </button>
      )
    : null
}
