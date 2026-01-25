'use client'

import React, { useEffect, useState } from 'react'
import { type SimpleMemoInfo } from '../../(domain)/memo'
import { fetchReferencedByMemoId, fetchReferencesByMemoId } from '../../(infra)/memo'
import { useMemoSystem } from '../../(usecase)/memo-system-usecases'
import Link from 'next/link'

interface BacklinksPanelProps {
  memoId: string
}

export function BacklinksPanel ({ memoId }: BacklinksPanelProps): React.ReactElement {
  const { navigatorContext } = useMemoSystem()
  const [outgoingLinks, setOutgoingLinks] = useState<SimpleMemoInfo[]>([])
  const [backlinks, setBacklinks] = useState<SimpleMemoInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (memoId === '') return

    const fetchLinks = async (): Promise<void> => {
      setIsLoading(true)
      try {
        const [outgoing, incoming] = await Promise.all([
          fetchReferencesByMemoId(memoId),
          fetchReferencedByMemoId(memoId)
        ])
        setOutgoingLinks(outgoing ?? [])
        setBacklinks(incoming ?? [])
      } finally {
        setIsLoading(false)
      }
    }

    void fetchLinks()
  }, [memoId, navigatorContext.refreshTrigger])

  if (memoId === '') {
    return (
      <div className="px-2 py-4 text-gray-500 text-center">
        메모를 선택하세요
      </div>
    )
  }

  return (
    <div className="bg-gray-900 text-green-400">
      {isLoading && (
        <div className="px-2 py-2 text-gray-500">loading...</div>
      )}

      {!isLoading && (
        <div className="py-2 space-y-2">
          {/* 참조중인 메모 */}
          <div>
            <div className="flex items-center gap-2 text-gray-400 px-2 py-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M17 7H7M17 7V17"/>
              </svg>
              <span>참조중인 메모</span>
              <span className="text-gray-500">({outgoingLinks.length})</span>
            </div>
            {outgoingLinks.length === 0
              ? (
                <p className="text-gray-600 pl-8 py-1">없음</p>
                )
              : (
                <ul>
                  {outgoingLinks.map((link) => (
                    <li key={link.id}>
                      <Link
                        href={`/memo/${link.id}`}
                        className="flex items-center gap-2 pl-8 pr-2 py-1 h-8 rounded cursor-pointer truncate hover:bg-gray-500 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        <span className="truncate">{link.title !== '' ? link.title : 'Untitled'}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                )}
          </div>

          {/* 이 메모를 참조한 메모 */}
          <div>
            <div className="flex items-center gap-2 text-gray-400 px-2 py-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 7L7 17M7 17V7M7 17H17"/>
              </svg>
              <span>이 메모를 참조한 메모</span>
              <span className="text-gray-500">({backlinks.length})</span>
            </div>
            {backlinks.length === 0
              ? (
                <p className="text-gray-600 pl-8 py-1">없음</p>
                )
              : (
                <ul>
                  {backlinks.map((link) => (
                    <li key={link.id}>
                      <Link
                        href={`/memo/${link.id}`}
                        className="flex items-center gap-2 pl-8 pr-2 py-1 h-8 rounded cursor-pointer truncate hover:bg-gray-500 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        <span className="truncate">{link.title !== '' ? link.title : 'Untitled'}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                )}
          </div>
        </div>
      )}
    </div>
  )
}
