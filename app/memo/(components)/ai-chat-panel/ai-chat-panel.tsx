'use client'
import React, { useEffect, useState } from 'react'
import { useAiChat } from '../../(usecase)/ai-chat-usecases'
import { useSession } from '../../../login/(usecase)/session-usecases'
import ChatMessageList from './chat-message-list'
import ChatInput from './chat-input'
import SessionSidebar from './session-sidebar'

interface AiChatPanelProps {
  onClose: () => void
}

export default function AiChatPanel ({ onClose }: AiChatPanelProps): React.ReactElement {
  const { session } = useSession()
  const {
    sessions,
    currentSessionId,
    messages,
    pendingMessages,
    isLoading,
    messagesHasNext,
    isLoadingMoreMessages,
    loadSessions,
    createNewSession,
    deleteSessionById,
    selectSession,
    loadMoreMessages,
    sendMessage
  } = useAiChat()

  const [initialized, setInitialized] = useState(false)

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
    const autoCreateSession = async (): Promise<void> => {
      if (!initialized || sessions.length > 0 || session?.userId === undefined) return

      try {
        const newSessionId = await createNewSession(session.userId, '새 대화')
        if (newSessionId !== null) {
          await selectSession(newSessionId, session.userId)
        }
      } catch (error) {
        console.error('Failed to create initial session:', error)
      }
    }

    void autoCreateSession()
  }, [initialized, sessions.length, session?.userId])

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
        await sendMessage(message, session.userId)
      } catch (error) {
        console.error('Failed to send message:', error)
      }
    })()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-900 w-full h-full max-w-6xl max-h-[90vh] rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-700 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-green-400">AI 채팅</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            title="닫기"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <SessionSidebar
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSelectSession={handleSelectSession}
            onNewSession={handleNewSession}
            onDeleteSession={handleDeleteSession}
          />

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-gray-800">
            {currentSessionId === null
              ? (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  대화를 선택하거나 새 대화를 시작하세요
                </div>
                )
              : (
                <>
                  <ChatMessageList
                    messages={messages}
                    pendingMessages={pendingMessages}
                    messagesHasNext={messagesHasNext}
                    isLoadingMoreMessages={isLoadingMoreMessages}
                    onLoadMoreMessages={() => {
                      if (session?.userId === undefined) return
                      void loadMoreMessages(session.userId)
                    }}
                  />
                  <ChatInput
                    onSend={handleSendMessage}
                    disabled={isLoading}
                  />
                </>
                )}
          </div>
        </div>
      </div>
    </div>
  )
}
