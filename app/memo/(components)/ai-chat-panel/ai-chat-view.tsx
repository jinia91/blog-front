'use client'
import React, { useEffect, useState } from 'react'
import { useAiChat } from '../../(usecase)/ai-chat-usecases'
import { useFolderAndMemo } from '../../(usecase)/memo-folder-usecases'
import { useSession } from '../../../login/(usecase)/session-usecases'
import { syncMemoEmbeddings } from '../../(infra)/ai-chat'
import ChatMessageList from './chat-message-list'
import ChatInput from './chat-input'
import SessionSidebar from './session-sidebar'

interface AiChatViewProps {
  onToggleView?: () => void
}

const SESSION_LIST_VISIBLE_KEY = 'ai-chat-session-list-visible'

export default function AiChatView ({ onToggleView }: AiChatViewProps): React.ReactElement {
  const { session } = useSession()
  const { refreshFolders } = useFolderAndMemo()
  const {
    sessions,
    currentSessionId,
    messages,
    pendingMessages,
    isLoading,
    messagesHasNext,
    isLoadingMoreMessages,
    error,
    clearError,
    loadSessions,
    createNewSession,
    deleteSessionById,
    selectSession,
    loadMoreMessages,
    sendMessage,
    clearCurrentSession
  } = useAiChat()

  const [initialized, setInitialized] = useState(false)
  const [sessionListVisible, setSessionListVisible] = useState(() => {
    if (typeof window === 'undefined') return true
    const saved = localStorage.getItem(SESSION_LIST_VISIBLE_KEY)
    return saved === null ? true : saved === 'true'
  })
  const [isSyncing, setIsSyncing] = useState(false)

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
      }
    }

    void autoSelectFirstSession()
  }, [initialized, sessions, session?.userId, currentSessionId, selectSession])

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

  const handleDeleteSession = (sessionId: number): void => {
    void (async () => {
      try {
        await deleteSessionById(sessionId)
      } catch (error) {
        console.error('Failed to delete session:', error)
      }
    })()
  }

  const handleSendMessage = (message: string): void => {
    if (session?.userId === undefined) return

    void (async () => {
      try {
        const createdMemoId = await sendMessage(message, session.userId)
        if (createdMemoId !== undefined) {
          await refreshFolders()
        }
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

  const toggleSessionList = (): void => {
    const newValue = !sessionListVisible
    setSessionListVisible(newValue)
    localStorage.setItem(SESSION_LIST_VISIBLE_KEY, String(newValue))
  }

  const handleSync = (): void => {
    if (session?.userId === undefined) return
    void (async () => {
      try {
        setIsSyncing(true)
        await syncMemoEmbeddings(session.userId)
        console.log('메모 임베딩 동기화 완료')
      } catch (error) {
        console.error('Failed to sync embeddings:', error)
      } finally {
        setIsSyncing(false)
      }
    })()
  }

  const renderChatContent = (): React.ReactElement => {
    if (!initialized) {
      return (
        <div className="flex-1 flex items-center justify-center dos-font">
          <div className="text-center">
            <div className="text-green-400 terminal-glow animate-pulse mb-2">■ 초기화 중...</div>
            <div className="text-gray-600 text-sm">세션 목록을 불러오고 있습니다</div>
          </div>
        </div>
      )
    }

    if (currentSessionId === null) {
      return (
        <div className="flex-1 flex items-center justify-center dos-font">
          <div className="text-center">
            <div className="text-green-400 terminal-glow mb-4">■ 세컨드 브레인</div>
            <div className="text-gray-500 mb-4">선택된 세션이 없습니다</div>
            <button
              onClick={handleNewSession}
              className="text-green-400 border border-green-400 px-4 py-2 hover:bg-green-400 hover:text-black transition-colors"
              type="button"
            >
              [새 대화 시작]
            </button>
          </div>
        </div>
      )
    }

    return (
      <ChatMessageList
        messages={messages}
        pendingMessages={pendingMessages}
        sessions={sessions}
        currentSessionId={currentSessionId}
        messagesHasNext={messagesHasNext}
        isLoadingMoreMessages={isLoadingMoreMessages}
        onSelectSession={handleSelectSession}
        onLoadMoreMessages={() => {
          if (session?.userId === undefined) return
          void loadMoreMessages(session.userId)
        }}
      />
    )
  }

  return (
    <div className="w-full h-full bg-black flex flex-col terminal-container terminal-scanlines">
      {/* Terminal Header */}
      <div className="border-b border-green-400/50 bg-black px-2 py-1 dos-font shrink-0 flex items-center gap-2 relative z-10">
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
        <button
          onClick={handleSync}
          disabled={!initialized || isSyncing}
          className="text-green-400 hover:bg-green-400 hover:text-black text-xs border border-green-400/50 px-2 py-0.5 transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          {isSyncing ? '[동기화중...]' : '[동기화]'}
        </button>
        <span className="text-gray-600">|</span>
        <span className="text-green-400 terminal-glow">■</span>
        <span className="text-green-400 terminal-glow text-sm">세컨드 브레인</span>
      </div>

      {/* Body with optional session sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {renderChatContent()}

          {/* Error Display */}
          {error !== null && (
            <div className="bg-red-900/50 border border-red-500 text-red-400 px-3 py-2 text-xs flex items-center justify-between dos-font shrink-0">
              <span>[오류] {error}</span>
              <button onClick={clearError} className="hover:text-red-300" type="button">✕</button>
            </div>
          )}

          {initialized && currentSessionId !== null && (
            <ChatInput
              onSend={handleSendMessage}
              onCommand={handleCommand}
              disabled={isLoading}
            />
          )}
        </div>

        {/* Session Sidebar - Right side, collapsible */}
        {sessionListVisible && (
          <SessionSidebar
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSelectSession={handleSelectSession}
            onNewSession={handleNewSession}
            onDeleteSession={handleDeleteSession}
          />
        )}
      </div>
    </div>
  )
}
