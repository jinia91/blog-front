import { atom, useAtom } from 'jotai'
import {
  type ChatSession,
  type ChatMessage,
  type PendingMessage
} from '../(domain)/ai-chat'
import {
  fetchSessions,
  createSession,
  fetchSessionMessages,
  sendChatMessage
} from '../(infra)/ai-chat'

const sessionsAtom = atom<ChatSession[]>([])
const currentSessionIdAtom = atom<number | null>(null)
const messagesAtom = atom<ChatMessage[]>([])
const pendingMessagesAtom = atom<PendingMessage[]>([])
const isLoadingAtom = atom<boolean>(false)
const errorAtom = atom<string | null>(null)
const hasNextAtom = atom<boolean>(false)
const nextCursorAtom = atom<number | null>(null)
const isLoadingMoreAtom = atom<boolean>(false)

export const useAiChat = (): {
  sessions: ChatSession[]
  currentSessionId: number | null
  messages: ChatMessage[]
  pendingMessages: PendingMessage[]
  isLoading: boolean
  isLoadingMore: boolean
  hasNext: boolean
  error: string | null
  clearError: () => void
  loadSessions: (userId: number) => Promise<void>
  loadMoreSessions: (userId: number) => Promise<void>
  createNewSession: (userId: number, title?: string) => Promise<number | null>
  selectSession: (sessionId: number, userId: number) => Promise<void>
  sendMessage: (message: string, userId: number) => Promise<void>
  clearCurrentSession: () => void
} => {
  const [sessions, setSessions] = useAtom(sessionsAtom)
  const [currentSessionId, setCurrentSessionId] = useAtom(currentSessionIdAtom)
  const [messages, setMessages] = useAtom(messagesAtom)
  const [pendingMessages, setPendingMessages] = useAtom(pendingMessagesAtom)
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom)
  const [error, setError] = useAtom(errorAtom)
  const [hasNext, setHasNext] = useAtom(hasNextAtom)
  const [nextCursor, setNextCursor] = useAtom(nextCursorAtom)
  const [isLoadingMore, setIsLoadingMore] = useAtom(isLoadingMoreAtom)

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
      setSessions(result.sessions)
      setHasNext(result.hasNext)
      setNextCursor(result.nextCursor)
    } catch (err) {
      setError('네트워크 오류가 발생했습니다')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const loadMoreSessions = async (userId: number): Promise<void> => {
    if (!hasNext || nextCursor === null || isLoadingMore) return

    setIsLoadingMore(true)
    try {
      const result = await fetchSessions(userId, nextCursor)
      if (result === null) {
        setError('세션 목록을 가져오는데 실패했습니다')
        throw new Error('세션 목록을 가져오는데 실패했습니다.')
      }
      setSessions([...sessions, ...result.sessions])
      setHasNext(result.hasNext)
      setNextCursor(result.nextCursor)
    } catch (err) {
      setError('네트워크 오류가 발생했습니다')
      throw err
    } finally {
      setIsLoadingMore(false)
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

  const selectSession = async (sessionId: number, userId: number): Promise<void> => {
    setIsLoading(true)
    try {
      setCurrentSessionId(sessionId)
      const fetchedMessages = await fetchSessionMessages(sessionId, userId)
      if (fetchedMessages === null) {
        setError('메시지를 가져오는데 실패했습니다')
        throw new Error('메시지를 가져오는데 실패했습니다.')
      }
      setMessages(fetchedMessages)
      setPendingMessages([])
    } catch (err) {
      setError('네트워크 오류가 발생했습니다')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async (message: string, userId: number): Promise<void> => {
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
    setCurrentSessionId(null)
    setMessages([])
    setPendingMessages([])
  }

  return {
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
  }
}
