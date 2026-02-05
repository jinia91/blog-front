import { HOST } from '../../(utils)/constants'
import { withAuthRetry } from '../../login/(infra)/auth-api'
import {
  type ChatMessage,
  type AiChatResponse,
  type RecommendedMemo,
  type SessionsPageResponse
} from '../(domain)/ai-chat'

export async function fetchSessions (
  userId: number,
  cursor?: number,
  size: number = 20
): Promise<SessionsPageResponse | null> {
  const params = new URLSearchParams({ userId: userId.toString(), size: size.toString() })
  if (cursor !== undefined) {
    params.append('cursor', cursor.toString())
  }

  const apiCall = async (): Promise<Response> => {
    return await fetch(HOST + `/ai/sessions?${params.toString()}`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
  const response = await withAuthRetry(apiCall)
  if (!response.ok) {
    console.debug('세션 목록 조회에 실패했습니다')
    return null
  }
  return await response.json()
}

export async function createSession (userId: number, title?: string): Promise<{ sessionId: number, title: string } | null> {
  const apiCall = async (): Promise<Response> => {
    return await fetch(HOST + `/ai/sessions?userId=${userId}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(title !== undefined ? { title } : {})
    })
  }
  const response = await withAuthRetry(apiCall)
  if (!response.ok) {
    console.debug('세션 생성에 실패했습니다')
    return null
  }
  return await response.json()
}

export async function fetchSessionMessages (sessionId: number, userId: number): Promise<ChatMessage[] | null> {
  const apiCall = async (): Promise<Response> => {
    return await fetch(HOST + `/ai/sessions/${sessionId}/messages?userId=${userId}`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
  const response = await withAuthRetry(apiCall)
  if (!response.ok) {
    console.debug('세션 메시지 조회에 실패했습니다')
    return null
  }
  return await response.json()
}

export async function sendChatMessage (sessionId: number, message: string, userId: number): Promise<AiChatResponse | null> {
  const apiCall = async (): Promise<Response> => {
    return await fetch(HOST + `/ai/chat?userId=${userId}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sessionId, message })
    })
  }
  const response = await withAuthRetry(apiCall)
  if (!response.ok) {
    console.debug('AI 채팅 메시지 전송에 실패했습니다')
    return null
  }
  return await response.json()
}

export async function fetchRecommendedMemos (
  userId: number,
  query?: string,
  memoId?: number,
  topK?: number
): Promise<RecommendedMemo[] | null> {
  const params = new URLSearchParams({ userId: userId.toString() })
  if (query !== undefined) params.append('query', query)
  if (memoId !== undefined) params.append('memoId', memoId.toString())
  if (topK !== undefined) params.append('topK', topK.toString())

  const apiCall = async (): Promise<Response> => {
    return await fetch(HOST + `/ai/recommend?${params.toString()}`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
  const response = await withAuthRetry(apiCall)
  if (!response.ok) {
    console.debug('추천 메모 조회에 실패했습니다')
    return null
  }
  return await response.json()
}

export async function syncMemoEmbeddings (
  userId: number,
  target?: string
): Promise<{ syncedCount: number, message: string } | null> {
  const apiCall = async (): Promise<Response> => {
    return await fetch(HOST + `/ai/sync?userId=${userId}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(target !== undefined ? { target } : {})
    })
  }
  const response = await withAuthRetry(apiCall)
  if (!response.ok) {
    console.debug('메모 임베딩 동기화에 실패했습니다')
    return null
  }
  return await response.json()
}
