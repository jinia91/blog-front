'use client'
import React from 'react'
import { useSaveStatus } from '../../(usecase)/article-system-usecases'

export function SaveIndicator (): React.ReactElement | null {
  const [saveStatus] = useSaveStatus()

  if (saveStatus === 'idle') {
    return null
  }

  return (
    <div className="flex items-center gap-2 text-sm font-mono">
      {saveStatus === 'saving' && (
        <>
          <div className="animate-spin h-3 w-3 border-2 border-gray-400 border-t-transparent rounded-full"/>
          <span className="text-gray-400">저장 중...</span>
        </>
      )}
      {saveStatus === 'saved' && (
        <>
          <svg className="h-3 w-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
          </svg>
          <span className="text-green-400">저장됨</span>
        </>
      )}
      {saveStatus === 'error' && (
        <>
          <svg className="h-3 w-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <span className="text-red-400">저장 실패</span>
        </>
      )}
    </div>
  )
}
