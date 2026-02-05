'use client'
import React from 'react'
import { type ChatSession } from '../../(domain)/ai-chat'

interface SessionSidebarProps {
  sessions: ChatSession[]
  currentSessionId: number | null
  hasNext: boolean
  isLoadingMore: boolean
  onSelectSession: (sessionId: number) => void
  onNewSession: () => void
  onLoadMore: () => void
}

export default function SessionSidebar ({
  sessions,
  currentSessionId,
  hasNext,
  isLoadingMore,
  onSelectSession,
  onNewSession,
  onLoadMore
}: SessionSidebarProps): React.ReactElement {
  return (
    <div className="w-48 bg-black border-l-2 border-green-400 flex flex-col dos-font">
      <div className="p-3 border-b-2 border-green-400">
        <button
          onClick={onNewSession}
          className="w-full px-3 py-2 border-2 border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-colors flex items-center justify-center gap-2 terminal-glow"
          type="button"
        >
          [+] NEW_SESSION
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {sessions.length === 0 && (
          <div className="text-gray-600 text-sm text-center p-4">
            대화 내역이 없습니다
          </div>
        )}
        {sessions.map((session) => {
          const isSelected = session.sessionId === currentSessionId
          const date = new Date(session.updatedAt).toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
          return (
            <button
              key={session.sessionId}
              onClick={() => { onSelectSession(session.sessionId) }}
              className={`w-full text-left p-2 mb-1 border transition-colors ${
                isSelected
                  ? 'border-2 border-green-400 bg-green-400/10 terminal-glow'
                  : 'border border-gray-700 hover:border-green-400/50'
              }`}
              type="button"
            >
              <div className={`truncate text-sm ${isSelected ? 'text-green-400' : 'text-gray-400'}`}>
                {'>'} {session.title}
              </div>
              <div className="text-xs text-gray-600 mt-1 ml-2">
                {date}
              </div>
            </button>
          )
        })}
        {hasNext && (
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="w-full mt-2 px-2 py-1 text-xs text-gray-500 hover:text-green-400 border border-gray-700 hover:border-green-400/50 transition-colors disabled:opacity-50"
            type="button"
          >
            {isLoadingMore ? '[로딩...]' : '[더 보기]'}
          </button>
        )}
      </div>
    </div>
  )
}
