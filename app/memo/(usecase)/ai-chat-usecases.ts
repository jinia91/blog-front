import { atom, useAtom } from 'jotai'
import {
  type ChatSession,
  type ChatMessage,
  type PendingMessage
} from '../(domain)/ai-chat'
import {
  fetchSessions,
  createSession,
  deleteSession,
  fetchSessionMessages,
  sendChatMessage
} from '../(infra)/ai-chat'

const sessionsAtom = atom<ChatSession[]>([])
const currentSessionIdAtom = atom<number | null>(null)
const messagesAtom = atom<ChatMessage[]>([])
const pendingMessagesAtom = atom<PendingMessage[]>([])
const isLoadingAtom = atom<boolean>(false)
const errorAtom = atom<string | null>(null)
const messagesHasNextAtom = atom<boolean>(false)
const messagesNextCursorAtom = atom<number | null>(null)
const isLoadingMoreMessagesAtom = atom<boolean>(false)

export const useAiChat = (): {
  sessions: ChatSession[]
  currentSessionId: number | null
  messages: ChatMessage[]
  pendingMessages: PendingMessage[]
  isLoading: boolean
  isLoadingMoreMessages: boolean
  messagesHasNext: boolean
  error: string | null
  clearError: () => void
  loadSessions: (userId: number) => Promise<void>
  createNewSession: (userId: number, title?: string) => Promise<number | null>
  deleteSessionById: (sessionId: number) => Promise<void>
  selectSession: (sessionId: number, userId: number) => Promise<void>
  loadMoreMessages: (userId: number) => Promise<void>
  sendMessage: (message: string, userId: number) => Promise<number | undefined>
  clearCurrentSession: () => void
} => {
  const [sessions, setSessions] = useAtom(sessionsAtom)
  const [currentSessionId, setCurrentSessionId] = useAtom(currentSessionIdAtom)
  const [messages, setMessages] = useAtom(messagesAtom)
  const [pendingMessages, setPendingMessages] = useAtom(pendingMessagesAtom)
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom)
  const [error, setError] = useAtom(errorAtom)
  const [messagesHasNext, setMessagesHasNext] = useAtom(messagesHasNextAtom)
  const [messagesNextCursor, setMessagesNextCursor] = useAtom(messagesNextCursorAtom)
  const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useAtom(isLoadingMoreMessagesAtom)

  const clearError = (): void => {
    setError(null)
  }

  const loadSessions = async (userId: number): Promise<void> => {
    setIsLoading(true)
    try {
      const result = await fetchSessions(userId)
      if (result === null) {
        setError('세션 목록을 가져오는데 실패했습니다')
        throw new Error('세션 목록을 가져오는데 실패했습니다.')
      }
      setSessions(result)
    } catch (err) {
      setError('네트워크 오류가 발생했습니다')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const createNewSession = async (userId: number, title?: string): Promise<number | null> => {
    setIsLoading(true)
    try {
      const newSession = await createSession(userId, title)
      if (newSession === null) {
        setError('세션 생성에 실패했습니다')
        throw new Error('세션 생성에 실패했습니다.')
      }
      const sessionWithTimestamp: ChatSession = {
        sessionId: newSession.sessionId,
        title: newSession.title,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setSessions([sessionWithTimestamp, ...sessions])
      return newSession.sessionId
    } catch (err) {
      setError('네트워크 오류가 발생했습니다')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const deleteSessionById = async (sessionId: number): Promise<void> => {
    try {
      const success = await deleteSession(sessionId)
      if (!success) {
        setError('세션 삭제에 실패했습니다')
        throw new Error('세션 삭제에 실패했습니다.')
      }
      setSessions(sessions.filter(s => s.sessionId !== sessionId))
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null)
        setMessages([])
        setPendingMessages([])
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다')
      throw err
    }
  }

  const selectSession = async (sessionId: number, userId: number): Promise<void> => {
    setIsLoading(true)
    try {
      setCurrentSessionId(sessionId)
      const result = await fetchSessionMessages(sessionId, userId)
      if (result === null) {
        setError('메시지를 가져오는데 실패했습니다')
        throw new Error('메시지를 가져오는데 실패했습니다.')
      }
      setMessages(result.messages)
      setMessagesHasNext(result.hasNext)
      setMessagesNextCursor(result.nextCursor)
      setPendingMessages([])
    } catch (err) {
      setError('네트워크 오류가 발생했습니다')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const loadMoreMessages = async (userId: number): Promise<void> => {
    if (!messagesHasNext || messagesNextCursor === null || isLoadingMoreMessages || currentSessionId === null) return

    setIsLoadingMoreMessages(true)
    try {
      const result = await fetchSessionMessages(currentSessionId, userId, messagesNextCursor)
      if (result === null) {
        setError('메시지를 가져오는데 실패했습니다')
        throw new Error('메시지를 가져오는데 실패했습니다.')
      }
      setMessages([...result.messages, ...messages])
      setMessagesHasNext(result.hasNext)
      setMessagesNextCursor(result.nextCursor)
    } catch (err) {
      setError('네트워크 오류가 발생했습니다')
      throw err
    } finally {
      setIsLoadingMoreMessages(false)
    }
  }

  const sendMessage = async (message: string, userId: number): Promise<number | undefined> => {
    if (currentSessionId === null) {
      setError('세션이 선택되지 않았습니다')
      throw new Error('세션이 선택되지 않았습니다.')
    }

    const tempId = Date.now().toString()
    const pendingMessage: PendingMessage = {
      tempId,
      content: message,
      status: 'pending',
      createdAt: new Date().toISOString()
    }

    setPendingMessages([...pendingMessages, pendingMessage])

    try {
      const response = await sendChatMessage(currentSessionId, message, userId)
      if (response === null) {
        setPendingMessages(prev =>
          prev.map(pm =>
            pm.tempId === tempId ? { ...pm, status: 'error' } : pm
          )
        )
        setError('메시지 전송에 실패했습니다')
        throw new Error('메시지 전송에 실패했습니다.')
      }

      setPendingMessages(prev => prev.filter(pm => pm.tempId !== tempId))

      const userMessage: ChatMessage = {
        messageId: Date.now(),
        role: 'USER',
        content: message,
        createdAt: new Date().toISOString()
      }

      const assistantMessage: ChatMessage = {
        messageId: Date.now() + 1,
        role: 'ASSISTANT',
        content: response.response,
        createdAt: new Date().toISOString()
      }

      setMessages([...messages, userMessage, assistantMessage])

      return response.createdMemoId
    } catch (err) {
      setPendingMessages(prev =>
        prev.map(pm =>
          pm.tempId === tempId ? { ...pm, status: 'error' } : pm
        )
      )
      if (err instanceof Error && err.message === '메시지 전송에 실패했습니다.') {
        // Error already set
      } else {
        setError('네트워크 오류가 발생했습니다')
      }
      throw err
    }
  }

  const clearCurrentSession = (): void => {
    setMessages([])
    setPendingMessages([])
  }

  return {
    sessions,
    currentSessionId,
    messages,
    pendingMessages,
    isLoading,
    isLoadingMoreMessages,
    messagesHasNext,
    error,
    clearError,
    loadSessions,
    createNewSession,
    deleteSessionById,
    selectSession,
    loadMoreMessages,
    sendMessage,
    clearCurrentSession
  }
}
