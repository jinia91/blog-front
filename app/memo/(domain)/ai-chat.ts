// Message role enum
export type MessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM'

// Chat session type
export interface ChatSession {
  sessionId: number
  title: string
  createdAt: string
  updatedAt: string
}

// Chat message type
export interface ChatMessage {
  messageId: number
  role: MessageRole
  content: string
  createdAt: string
}

// AI chat response type
export interface AiChatResponse {
  sessionId: number
  response: string
  createdMemoId?: number
}

// Recommended memo type
export interface RecommendedMemo {
  memoId: number
  title: string
  contentPreview: string
  similarity: number
}

// Pending message type for optimistic updates
export interface PendingMessage {
  tempId: string
  content: string
  status: 'pending' | 'sent' | 'error'
  createdAt: string
}

// Sessions page response type for pagination
export interface SessionsPageResponse {
  sessions: ChatSession[]
  hasNext: boolean
  nextCursor: number | null
}
