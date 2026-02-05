'use client'
import React, { useEffect, useState } from 'react'
import { useAiChat } from '../../(usecase)/ai-chat-usecases'
import { useSession } from '../../../login/(usecase)/session-usecases'
import ChatMessageList from './chat-message-list'
import ChatInput from './chat-input'
import SessionSidebar from './session-sidebar'

interface AiChatViewProps {
  onToggleView?: () => void
}

const SESSION_LIST_VISIBLE_KEY = 'ai-chat-session-list-visible'

export default function AiChatView ({ onToggleView }: AiChatViewProps): React.ReactElement {
  const { session } = useSession()
  const {
    sessions,
    currentSessionId,
    messages,
    pendingMessages,
    isLoading,
    isLoadingMore,
    hasNext,
    error,
    clearError,
    loadSessions,
    loadMoreSessions,
    createNewSession,
    selectSession,
    sendMessage,
    clearCurrentSession
  } = useAiChat()

  const [initialized, setInitialized] = useState(false)
  const [sessionListVisible, setSessionListVisible] = useState(() => {
    if (typeof window === 'undefined') return true
    const saved = localStorage.getItem(SESSION_LIST_VISIBLE_KEY)
    return saved === null ? true : saved === 'true'
  })

  useEffect(() => {
    const initializeChat = async (): Promise<void> => {
      if (session?.userId === undefined) return

      try {
        await loadSessions(session.userId)
        setInitialized(true)
      } catch (error) {
        console.error('Failed to load sessions:', error)
      }
    }

    void initializeChat()
  }, [session?.userId])

  useEffect(() => {
    const autoSelectFirstSession = async (): Promise<void> => {
      if (!initialized || session?.userId === undefined) return

      // If sessions exist and no session is selected, select the first one
      if (sessions.length > 0 && currentSessionId === null) {
        await selectSession(sessions[0].sessionId, session.userId)
      } else if (sessions.length === 0) {
        // If no sessions exist, create and select a new one
        const newSessionId = await createNewSession(session.userId, '새 대화')
        if (newSessionId !== null) {
          await selectSession(newSessionId, session.userId)
        }
      }
    }

    void autoSelectFirstSession()
  }, [initialized, sessions, session?.userId, currentSessionId, selectSession, createNewSession])

  const handleSelectSession = (sessionId: number): void => {
    if (session?.userId === undefined) return

    void (async () => {
      try {
        await selectSession(sessionId, session.userId)
      } catch (error) {
        console.error('Failed to select session:', error)
      }
    })()
  }

  const handleSendMessage = (message: string): void => {
    if (session?.userId === undefined) return

    void (async () => {
      try {
        await sendMessage(message, session.userId)
      } catch (error) {
        console.error('Failed to send message:', error)
      }
    })()
  }

  const handleCommand = (command: string): void => {
    const cmd = command.toLowerCase().trim()

    if (cmd === '/new') {
      if (session?.userId === undefined) return
      void (async () => {
        try {
          const newSessionId = await createNewSession(session.userId, '새 대화')
          if (newSessionId !== null) {
            await selectSession(newSessionId, session.userId)
          }
        } catch (error) {
          console.error('Failed to create new session:', error)
        }
      })()
    } else if (cmd === '/clear') {
      clearCurrentSession()
    } else if (cmd === '/help') {
      // Help is shown as a system message by passing it through
      handleSendMessage(command)
    } else if (cmd === '/list') {
      // List command will be handled in ChatMessageList
      handleSendMessage(command)
    } else {
      // Unknown command, just send as regular message
      handleSendMessage(command)
    }
  }

  const handleNewSession = (): void => {
    if (session?.userId === undefined) return
    void (async () => {
      try {
        const newSessionId = await createNewSession(session.userId, '새 대화')
        if (newSessionId !== null) {
          await selectSession(newSessionId, session.userId)
        }
      } catch (error) {
        console.error('Failed to create new session:', error)
      }
    })()
  }

  const handleLoadMoreSessions = (): void => {
    if (session?.userId === undefined) return
    void (async () => {
      try {
        await loadMoreSessions(session.userId)
      } catch (error) {
        console.error('Failed to load more sessions:', error)
      }
    })()
  }

  const toggleSessionList = (): void => {
    const newValue = !sessionListVisible
    setSessionListVisible(newValue)
    localStorage.setItem(SESSION_LIST_VISIBLE_KEY, String(newValue))
  }

  return (
    <div className="w-full h-full bg-black flex flex-col terminal-container terminal-scanlines">
      {/* Terminal Header */}
      <div className="border-b border-green-400/50 bg-black px-2 py-1 dos-font shrink-0 flex items-center gap-2" style={{ zIndex: 9999 }}>
        <button onClick={onToggleView} className="text-green-400 hover:bg-green-400 hover:text-black text-xs border border-green-400/50 px-2 py-0.5 transition-colors shrink-0" type="button">
          [그래프]
        </button>
        <button
          onClick={toggleSessionList}
          className="text-green-400 hover:bg-green-400 hover:text-black text-xs border border-green-400/50 px-2 py-0.5 transition-colors shrink-0"
          type="button"
        >
          {sessionListVisible ? '[세션]' : '[세션+]'}
        </button>
        <span className="text-gray-600">|</span>
        <span className="text-green-400 terminal-glow">■</span>
        <span className="text-green-400 terminal-glow text-sm">세컨드 브레인</span>
      </div>

      {/* Body with optional session sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <ChatMessageList
            messages={messages}
            pendingMessages={pendingMessages}
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSelectSession={handleSelectSession}
          />

          {/* Error Display */}
          {error !== null && (
            <div className="bg-red-900/50 border border-red-500 text-red-400 px-3 py-2 text-xs flex items-center justify-between dos-font shrink-0">
              <span>[오류] {error}</span>
              <button onClick={clearError} className="hover:text-red-300" type="button">✕</button>
            </div>
          )}

          <ChatInput
            onSend={handleSendMessage}
            onCommand={handleCommand}
            disabled={isLoading}
          />
        </div>

        {/* Session Sidebar - Right side, collapsible */}
        {sessionListVisible && (
          <SessionSidebar
            sessions={sessions}
            currentSessionId={currentSessionId}
            hasNext={hasNext}
            isLoadingMore={isLoadingMore}
            onSelectSession={handleSelectSession}
            onNewSession={handleNewSession}
            onLoadMore={handleLoadMoreSessions}
          />
        )}
      </div>
    </div>
  )
}
