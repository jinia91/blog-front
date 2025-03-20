'use client'

import React from 'react'
import { useSession } from '../../login/(usecase)/session-usecases'
import { useTabBarAndRouter } from '../../(layout)/(usecase)/tab-usecases'

export default function EditButton (
  { articleId }: { articleId: string }
): React.JSX.Element | null {
  const { session } = useSession()
  const { upsertAndSelectTab } = useTabBarAndRouter()

  return session?.roles.values().next().value === 'ADMIN'
    ? (
      <button
        className="px-4 py-2 font-mono text-sm bg-gray-800 text-green-400 border border-green-400 rounded shadow-lg transition-all hover:bg-green-700 hover:text-gray-100 hover:shadow-green-400"
        onClick={() => {
          upsertAndSelectTab({ name: 'Edit Article', urlPath: `/blog/edit/${articleId}` })
        }}
      >
        Edit
      </button>
      )
    : null
}
