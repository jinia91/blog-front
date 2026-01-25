import { useEffect, useRef, useState } from 'react'
import SockJS from 'sockjs-client'
import { type Client, type CompatClient, type IMessage, Stomp } from '@stomp/stompjs'
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
  const [stompClient, setStompClient] = useState<Client | null>(null)
  const { refreshReference } = useMemoSystem()
  const {
    setConnecting,
    setConnected,
    setDisconnected,
    setReconnecting,
    setError
  } = useWebSocketStatus()
  const reconnectAttemptsRef = useRef(0)

  useEffect(() => {
    let client: CompatClient | null = null
    let reconnectTimeoutId: NodeJS.Timeout | null = null

    const connectStompClient = (): void => {
      // 최대 재연결 시도 횟수 초과 시 중단
      if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
        setError(`최대 재연결 시도 횟수(${MAX_RECONNECT_ATTEMPTS}회)를 초과했습니다. 페이지를 새로고침해주세요.`)
        return
      }

      // 재연결 시도인 경우 상태 업데이트
      if (reconnectAttemptsRef.current > 0) {
        setReconnecting()
      } else {
        setConnecting()
      }

      const socket = new SockJS(process.env.NEXT_PUBLIC_HOST + '/ws')
      client = Stomp.over(socket)

      // STOMP 디버그 로그 비활성화 (프로덕션용)
      client.debug = () => {}

      const onConnect = (): void => {
        setStompClient(client)
        setConnected()
        reconnectAttemptsRef.current = 0

        if (client === null) {
          return
        }

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
        setStompClient(null)
        setDisconnected()
        reconnectAttemptsRef.current += 1

        // Exponential backoff로 재연결 시도
        const delay = calculateReconnectDelay(reconnectAttemptsRef.current)
        console.debug(`${delay}ms 후 재연결 시도 (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`)

        reconnectTimeoutId = setTimeout(connectStompClient, delay)
      }

      client.connect({}, onConnect, onError)
    }

    connectStompClient()

    return () => {
      if (reconnectTimeoutId !== null) {
        clearTimeout(reconnectTimeoutId)
      }
      if (client != null) {
        client.disconnect()
      }
      setDisconnected()
    }
  }, [])

  useEffect(() => {
    debouncedUpdateMemo()
    debouncedUpdateReferences()
  }, [title, content])

  const debouncedUpdateMemo = useDebouncedCallback(() => {
    if (stompClient != null && memoId !== '') {
      const command = {
        type: 'UpdateMemo',
        id: memoId,
        title,
        content
      }

      try {
        stompClient.publish({
          destination: '/memo/updateMemo',
          body: JSON.stringify(command)
        })
      } catch (error) {
        console.debug('메모 업데이트 전송 실패:', error)
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

    if (isDifferent && stompClient != null && memoId !== '') {
      setReferences(ids.map(id => ({ id: Number(memoId), referenceId: id })))
      const command = {
        type: 'UpdateReferences',
        id: memoId,
        references: ids
      }

      try {
        stompClient.publish({
          destination: '/memo/updateReferences',
          body: JSON.stringify(command)
        })
        refreshReference()
      } catch (error) {
        console.debug('참조 업데이트 전송 실패:', error)
        setError('참조 저장에 실패했습니다. 연결을 확인해주세요.')
      }
    }
  }, 500)
}

export default useMemoStompClient
