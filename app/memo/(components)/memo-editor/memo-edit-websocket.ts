import { useCallback, useEffect, useRef } from 'react'
import SockJS from 'sockjs-client'
import { type CompatClient, type IMessage, Stomp } from '@stomp/stompjs'
import { useDebouncedCallback } from 'use-debounce'
import { type ReferenceInfo } from '../../(domain)/memo'
import { useMemoSystem } from '../../(usecase)/memo-system-usecases'
import { useWebSocketStatus } from '../../(usecase)/websocket-status-usecases'

const MAX_RECONNECT_ATTEMPTS = 10
const BASE_RECONNECT_DELAY = 1000
const MAX_RECONNECT_DELAY = 30000

const calculateReconnectDelay = (attempts: number): number => {
  return Math.min(BASE_RECONNECT_DELAY * Math.pow(2, attempts), MAX_RECONNECT_DELAY)
}

const useMemoStompClient = (
  memoId: string,
  title: string,
  content: string,
  references: ReferenceInfo[],
  setReferences: (references: ReferenceInfo[]) => void
): void => {
  const clientRef = useRef<CompatClient | null>(null)
  const { refreshReference } = useMemoSystem()
  const {
    setConnecting,
    setConnected,
    setDisconnected,
    setReconnecting,
    setError,
    resetReconnectAttempts
  } = useWebSocketStatus()
  const reconnectAttemptsRef = useRef(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isConnectingRef = useRef(false)

  const connectStompClient = useCallback((): void => {
    // 이미 연결 중이거나 연결된 상태면 스킵
    if (isConnectingRef.current || (clientRef.current?.connected === true)) {
      return
    }

    // 최대 재연결 시도 횟수 초과 시 중단
    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      setError(`최대 재연결 시도 횟수(${MAX_RECONNECT_ATTEMPTS}회)를 초과했습니다. 페이지를 새로고침해주세요.`)
      return
    }

    isConnectingRef.current = true

    // 재연결 시도인 경우 상태 업데이트
    if (reconnectAttemptsRef.current > 0) {
      setReconnecting()
    } else {
      setConnecting()
    }

    const socket = new SockJS(process.env.NEXT_PUBLIC_HOST + '/ws')
    const client = Stomp.over(socket)

    // STOMP 디버그 로그 비활성화 (프로덕션용)
    client.debug = () => {}

    const onConnect = (): void => {
      clientRef.current = client
      isConnectingRef.current = false
      setConnected()
      reconnectAttemptsRef.current = 0

      // 메모 업데이트 응답 처리
      client.subscribe('/topic/memoResponse', (message: IMessage) => {
        try {
          const response = JSON.parse(message.body)
          if (response.type === 'MemoUpdated' && response.success === true) {
            // 저장 성공 확인 (필요시 UI 피드백 추가 가능)
            console.debug('메모 저장 완료:', response)
          }
        } catch (e) {
          // JSON 파싱 실패 시 무시
        }
      })

      // 참조 업데이트 응답 처리
      client.subscribe('/topic/memoResponse/updateReferences', (message) => {
        refreshReference()
      })
    }

    const onError = (error: any): void => {
      console.debug('WebSocket 연결 오류:', error)
      clientRef.current = null
      isConnectingRef.current = false
      setDisconnected()
      reconnectAttemptsRef.current += 1

      // Exponential backoff로 재연결 시도
      const delay = calculateReconnectDelay(reconnectAttemptsRef.current)
      console.debug(`${delay}ms 후 재연결 시도 (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`)

      reconnectTimeoutRef.current = setTimeout(connectStompClient, delay)
    }

    client.connect({}, onConnect, onError)
  }, [setConnecting, setConnected, setDisconnected, setReconnecting, setError, refreshReference])

  // 수동 재연결 (탭 활성화 시 또는 메시지 전송 시 사용)
  const manualReconnect = useCallback((): void => {
    // 이미 연결되어 있으면 스킵
    if (clientRef.current?.connected === true) {
      return
    }

    // 재연결 시도 횟수 리셋하고 새로 연결
    reconnectAttemptsRef.current = 0
    resetReconnectAttempts()

    // 기존 타임아웃 취소
    if (reconnectTimeoutRef.current !== null) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    connectStompClient()
  }, [connectStompClient, resetReconnectAttempts])

  // 연결 상태 확인 후 메시지 전송
  const ensureConnectedAndPublish = useCallback((destination: string, body: string): boolean => {
    if (clientRef.current?.connected === true) {
      try {
        clientRef.current.publish({ destination, body })
        return true
      } catch (error) {
        console.debug('메시지 전송 실패:', error)
        manualReconnect()
        return false
      }
    } else {
      // 연결이 끊겨있으면 재연결 시도
      manualReconnect()
      return false
    }
  }, [manualReconnect])

  useEffect(() => {
    connectStompClient()

    // 탭 활성화 시 연결 상태 확인 및 재연결
    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'visible') {
        // 탭이 활성화되면 연결 상태 확인
        if (clientRef.current?.connected !== true) {
          console.debug('탭 활성화됨 - WebSocket 재연결 시도')
          manualReconnect()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (reconnectTimeoutRef.current !== null) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (clientRef.current != null) {
        clientRef.current.disconnect()
      }
      setDisconnected()
    }
  }, [connectStompClient, manualReconnect, setDisconnected])

  useEffect(() => {
    debouncedUpdateMemo()
    debouncedUpdateReferences()
  }, [title, content])

  const debouncedUpdateMemo = useDebouncedCallback(() => {
    if (memoId !== '') {
      const command = {
        type: 'UpdateMemo',
        id: memoId,
        title,
        content
      }

      const success = ensureConnectedAndPublish('/memo/updateMemo', JSON.stringify(command))
      if (!success) {
        setError('메모 저장에 실패했습니다. 연결을 확인해주세요.')
      }
    }
  }, 1000)

  const debouncedUpdateReferences = useDebouncedCallback(() => {
    const referencePattern = /<!-- reference: (\d+) -->/g
    let match
    const ids: number[] = []

    while ((match = referencePattern.exec(content)) !== null) {
      ids.push(Number(match[1]))
    }

    const newIdsSet = new Set(ids)
    const originIds = references.map(reference => reference.referenceId)
    const originIdsSet = new Set(originIds)
    const isDifferent = ids.some(id => !originIdsSet.has(id)) || originIds.some(id => !newIdsSet.has(id))

    if (isDifferent && memoId !== '') {
      setReferences(ids.map(id => ({ id: Number(memoId), referenceId: id })))
      const command = {
        type: 'UpdateReferences',
        id: memoId,
        references: ids
      }

      const success = ensureConnectedAndPublish('/memo/updateReferences', JSON.stringify(command))
      if (success) {
        refreshReference()
      } else {
        setError('참조 저장에 실패했습니다. 연결을 확인해주세요.')
      }
    }
  }, 500)
}

export default useMemoStompClient
