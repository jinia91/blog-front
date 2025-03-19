'use client'

import React, { useCallback } from 'react'
import { useSession } from '../../login/(usecase)/session-usecases'
import { deleteArticle } from '../(infra)/article'
import { useTabBarAndRouter } from '../../(layout)/(usecase)/tab-usecases'

export default function DeleteButton (
  { articleId }: { articleId: string }
): React.JSX.Element | null {
  const { selectedTabIdx, closeTab } = useTabBarAndRouter()
  const handleDeleteClick = useCallback(() => {
    void deleteArticle(articleId)
    closeTab(selectedTabIdx)
  }, [])

  const { session } = useSession()
  return session?.roles.values().next().value === 'ADMIN'
    ? (
      <button
        className="px-4 py-2 font-mono text-sm bg-gray-800 text-red-400 border border-red-400 rounded shadow-lg transition-all hover:bg-red-700 hover:text-gray-100 hover:shadow-red-400 ml-4"
        onClick={handleDeleteClick}
      >
        Delete
      </button>
      )
    : null
}
