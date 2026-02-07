'use client'
import React from 'react'
import { type ChatSession } from '../../(domain)/ai-chat'

interface SessionSidebarProps {
  sessions: ChatSession[]
  currentSessionId: number | null
  onSelectSession: (sessionId: number) => void
  onNewSession: () => void
  onDeleteSession: (sessionId: number) => void
}

export default function SessionSidebar ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession
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
        {(!Array.isArray(sessions) || sessions.length === 0) && (
          <div className="text-gray-600 text-sm text-center p-4">
            대화 내역이 없습니다
          </div>
        )}
        {Array.isArray(sessions) && sessions.map((session) => {
          const isSelected = session.sessionId === currentSessionId
          const date = new Date(session.updatedAt).toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
          return (
            <div
              key={session.sessionId}
              className={`relative w-full text-left p-2 mb-1 border transition-colors group ${
                isSelected
                  ? 'border-2 border-green-400 bg-green-400/10 terminal-glow'
                  : 'border border-gray-700 hover:border-green-400/50'
              }`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteSession(session.sessionId)
                }}
                className="absolute top-1 right-1 text-gray-600 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                type="button"
              >
                ✕
              </button>
              <button
                onClick={() => { onSelectSession(session.sessionId) }}
                className="w-full text-left"
                type="button"
              >
                <div className={`truncate text-sm pr-4 ${isSelected ? 'text-green-400' : 'text-gray-400'}`}>
                  {'>'} {session.title}
                </div>
                <div className="text-xs text-gray-600 mt-1 ml-2">
                  {date}
                </div>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
