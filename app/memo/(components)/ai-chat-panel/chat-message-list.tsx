'use client'
import React, { useEffect, useRef } from 'react'
import { type ChatMessage, type PendingMessage, type ChatSession } from '../../(domain)/ai-chat'

interface ChatMessageListProps {
  messages: ChatMessage[]
  pendingMessages: PendingMessage[]
  sessions?: ChatSession[]
  currentSessionId?: number | null
  messagesHasNext?: boolean
  isLoadingMoreMessages?: boolean
  onSelectSession?: (sessionId: number) => void
  onLoadMoreMessages?: () => void
}

export default function ChatMessageList ({
  messages,
  pendingMessages,
  sessions,
  currentSessionId,
  messagesHasNext,
  isLoadingMoreMessages,
  onSelectSession,
  onLoadMoreMessages
}: ChatMessageListProps): React.ReactElement {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current !== null) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, pendingMessages])

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 dos-font text-sm bg-black">
      {/* Load more messages button */}
      {messagesHasNext === true && (
        <div className="text-center mb-4">
          <button
            onClick={onLoadMoreMessages}
            disabled={isLoadingMoreMessages}
            className="text-xs text-gray-500 hover:text-green-400 border border-gray-700 hover:border-green-400/50 px-3 py-1 transition-colors disabled:opacity-50"
            type="button"
          >
            {isLoadingMoreMessages === true ? '[로딩...]' : '[이전 메시지 더 보기]'}
          </button>
        </div>
      )}

      {/* Welcome message if empty */}
      {messages.length === 0 && pendingMessages.length === 0 && (
        <div className="text-gray-500 mb-4">
          <div className="text-green-400 terminal-glow mb-2">세컨드 브레인에 오신 것을 환영합니다</div>
          <div>AI 기반 메모리 어시스턴트입니다.</div>
          <div className="mt-2">• 아무 내용이나 입력하면 메모로 저장됩니다</div>
          <div>• 질문하면 기존 메모를 검색하여 답변합니다</div>
          <div>• /help 명령어로 도움말을 볼 수 있습니다</div>
          <div className="mt-4 border-t border-gray-800 pt-2"></div>
        </div>
      )}

      {/* Messages */}
      {messages.map((msg) => {
        // Handle /list command
        if (msg.role === 'USER' && msg.content.toLowerCase().trim() === '/list') {
          return (
            <div key={msg.messageId} className="mb-4">
              <div className="text-green-400">
                <span className="text-cyan-400">user@brain</span>
                <span className="text-white">:</span>
                <span className="text-blue-400">~</span>
                <span className="text-white">$ </span>
                <span className="text-gray-200">{msg.content}</span>
              </div>
              {(sessions !== undefined) && (
                <div className="mt-2 ml-2 border-l border-cyan-400/30 pl-4">
                  <div className="text-yellow-400 mb-2">[세션 목록]</div>
                  {sessions.length === 0
                    ? (
                      <div className="text-gray-500">세션이 없습니다.</div>
                      )
                    : (
                        sessions.map((s) => (
                          <div
                            key={s.sessionId}
                            className={`flex items-center gap-2 py-1 ${
                              s.sessionId === currentSessionId ? 'text-green-400' : 'text-gray-400'
                            }`}
                          >
                            <span>{s.sessionId === currentSessionId ? '>' : ' '}</span>
                            <button
                              onClick={() => { onSelectSession?.(s.sessionId) }}
                              className="hover:text-green-300 text-left"
                              type="button"
                            >
                              [{s.sessionId}] {s.title}
                            </button>
                          </div>
                        ))
                      )}
                </div>
              )}
            </div>
          )
        }

        // Handle /help command
        if (msg.role === 'USER' && msg.content.toLowerCase().trim() === '/help') {
          return (
            <div key={msg.messageId} className="mb-4">
              <div className="text-green-400">
                <span className="text-cyan-400">user@brain</span>
                <span className="text-white">:</span>
                <span className="text-blue-400">~</span>
                <span className="text-white">$ </span>
                <span className="text-gray-200">{msg.content}</span>
              </div>
              <div className="mt-2 ml-2 border-l border-cyan-400/30 pl-4 text-gray-300">
                <div className="text-yellow-400 mb-2">[도움말]</div>
                <div>/new - 새 대화 세션 생성</div>
                <div>/list - 모든 대화 세션 목록 보기</div>
                <div>/clear - 현재 세션 메시지 초기화</div>
                <div>/help - 도움말 보기</div>
              </div>
            </div>
          )
        }

        if (msg.role === 'USER') {
          return (
            <div key={msg.messageId} className="mb-3">
              <div className="text-green-400">
                <span className="text-cyan-400">user@brain</span>
                <span className="text-white">:</span>
                <span className="text-blue-400">~</span>
                <span className="text-white">$ </span>
                <span className="text-gray-200">{msg.content}</span>
              </div>
            </div>
          )
        } else if (msg.role === 'ASSISTANT') {
          return (
            <div key={msg.messageId} className="mb-3">
              <div className="text-gray-300 pl-2 border-l border-cyan-400/30 ml-2 mt-1">
                {msg.content.split('\n').map((line, i) => (
                  <div key={i} className="flex">
                    <span className="text-cyan-400 mr-2">{'<'}</span>
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        } else {
          return (
            <div key={msg.messageId} className="mb-3">
              <div className="text-yellow-400 text-xs">
                [SYSTEM] {msg.content}
              </div>
            </div>
          )
        }
      })}

      {/* Pending messages */}
      {pendingMessages.map((msg) => (
        <div key={msg.tempId} className="mb-3">
          <div className="text-green-400">
            <span className="text-cyan-400">user@brain</span>
            <span className="text-white">:</span>
            <span className="text-blue-400">~</span>
            <span className="text-white">$ </span>
            <span className="text-gray-200">{msg.content}</span>
          </div>
          <div className="text-yellow-400 text-xs mt-1 ml-2">
            {msg.status === 'pending'
              ? (
                <span className="animate-pulse">[처리 중...]</span>
                )
              : msg.status === 'error'
                ? (
                  <span className="text-red-400">[오류] 처리에 실패했습니다</span>
                  )
                : null}
          </div>
        </div>
      ))}
    </div>
  )
}
