/**
 * WebSocket 연결 상태 타입 정의
 */

export enum ConnectionStatus {
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  RECONNECTING = 'RECONNECTING',
  ERROR = 'ERROR'
}

export interface WebSocketState {
  status: ConnectionStatus
  lastError: string | null
  reconnectAttempts: number
  lastConnectedAt: Date | null
}

export const initialWebSocketState: WebSocketState = {
  status: ConnectionStatus.DISCONNECTED,
  lastError: null,
  reconnectAttempts: 0,
  lastConnectedAt: null
}
