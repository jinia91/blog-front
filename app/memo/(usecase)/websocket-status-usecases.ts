import { atom, useAtom } from 'jotai'
import { ConnectionStatus, initialWebSocketState, type WebSocketState } from '../(domain)/websocket-status'

const websocketStatusAtom = atom<WebSocketState>(initialWebSocketState)

export interface WebSocketStatusActions {
  status: ConnectionStatus
  lastError: string | null
  reconnectAttempts: number
  isConnected: boolean
  setConnecting: () => void
  setConnected: () => void
  setDisconnected: () => void
  setReconnecting: () => void
  setError: (message: string) => void
  resetReconnectAttempts: () => void
}

export const useWebSocketStatus = (): WebSocketStatusActions => {
  const [state, setState] = useAtom(websocketStatusAtom)

  const setConnecting = (): void => {
    setState(prev => ({
      ...prev,
      status: ConnectionStatus.CONNECTING,
      lastError: null
    }))
  }

  const setConnected = (): void => {
    setState({
      status: ConnectionStatus.CONNECTED,
      lastError: null,
      reconnectAttempts: 0,
      lastConnectedAt: new Date()
    })
  }

  const setDisconnected = (): void => {
    setState(prev => ({
      ...prev,
      status: ConnectionStatus.DISCONNECTED
    }))
  }

  const setReconnecting = (): void => {
    setState(prev => ({
      ...prev,
      status: ConnectionStatus.RECONNECTING,
      reconnectAttempts: prev.reconnectAttempts + 1
    }))
  }

  const setError = (message: string): void => {
    setState(prev => ({
      ...prev,
      status: ConnectionStatus.ERROR,
      lastError: message
    }))
  }

  const resetReconnectAttempts = (): void => {
    setState(prev => ({
      ...prev,
      reconnectAttempts: 0
    }))
  }

  return {
    status: state.status,
    lastError: state.lastError,
    reconnectAttempts: state.reconnectAttempts,
    isConnected: state.status === ConnectionStatus.CONNECTED,
    setConnecting,
    setConnected,
    setDisconnected,
    setReconnecting,
    setError,
    resetReconnectAttempts
  }
}
