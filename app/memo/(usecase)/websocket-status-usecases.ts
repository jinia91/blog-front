import { atom, useAtom } from 'jotai'
import { useCallback } from 'react'
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

  const setConnecting = useCallback((): void => {
    setState(prev => ({
      ...prev,
      status: ConnectionStatus.CONNECTING,
      lastError: null
    }))
  }, [setState])

  const setConnected = useCallback((): void => {
    setState({
      status: ConnectionStatus.CONNECTED,
      lastError: null,
      reconnectAttempts: 0,
      lastConnectedAt: new Date()
    })
  }, [setState])

  const setDisconnected = useCallback((): void => {
    setState(prev => ({
      ...prev,
      status: ConnectionStatus.DISCONNECTED
    }))
  }, [setState])

  const setReconnecting = useCallback((): void => {
    setState(prev => ({
      ...prev,
      status: ConnectionStatus.RECONNECTING,
      reconnectAttempts: prev.reconnectAttempts + 1
    }))
  }, [setState])

  const setError = useCallback((message: string): void => {
    setState(prev => ({
      ...prev,
      status: ConnectionStatus.ERROR,
      lastError: message
    }))
  }, [setState])

  const resetReconnectAttempts = useCallback((): void => {
    setState(prev => ({
      ...prev,
      reconnectAttempts: 0
    }))
  }, [setState])

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
