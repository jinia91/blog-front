import { useEffect, useRef, useState } from 'react'
import SockJS from 'sockjs-client'
import { type Client, type CompatClient, type IMessage, Stomp } from '@stomp/stompjs'
import { useDebouncedCallback } from 'use-debounce'

const MAX_RECONNECT_ATTEMPTS = 10
const BASE_RECONNECT_DELAY = 1000
const MAX_RECONNECT_DELAY = 30000

const calculateReconnectDelay = (attempts: number): number => {
  return Math.min(BASE_RECONNECT_DELAY * Math.pow(2, attempts), MAX_RECONNECT_DELAY)
}

const useArticleStompClient = (
  articleId: string,
  articleTitle: string,
  articleContent: string,
  thumbnail: string
): void => {
  const [stompClient, setStompClient] = useState<Client | null>(null)
  const reconnectAttemptsRef = useRef(0)

  useEffect(() => {
    let client: CompatClient | null = null
    let reconnectTimeoutId: NodeJS.Timeout | null = null

    const connectStompClient = (): void => {
      // 최대 재연결 시도 횟수 초과 시 중단
      if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
        console.error(`최대 재연결 시도 횟수(${MAX_RECONNECT_ATTEMPTS}회)를 초과했습니다. 페이지를 새로고침해주세요.`)
        return
      }

      const socket = new SockJS(process.env.NEXT_PUBLIC_HOST + '/ws')
      client = Stomp.over(socket)

      // STOMP 디버그 로그 비활성화
      client.debug = () => {}

      const onConnect = (): void => {
        setStompClient(client)
        reconnectAttemptsRef.current = 0

        if (client === null) {
          return
        }
        client.subscribe('/topic/articleResponse', (message: IMessage) => {
          //   consume
        })
      }

      const onError = (error: any): void => {
        console.debug('WebSocket 연결 오류:', error)
        setStompClient(null)
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
    }
  }, [])

  useEffect(() => {
    debouncedUpdateMemo()
  }, [articleContent, articleTitle, thumbnail])

  const debouncedUpdateMemo = useDebouncedCallback(() => {
    if ((stompClient != null) && (articleId !== '')) {
      const command = {
        type: 'UpdateArticle',
        articleId,
        content: articleTitle,
        title: articleContent,
        thumbnailUrl: thumbnail
      }

      stompClient.publish({
        destination: '/article/updateArticle',
        body: JSON.stringify(command)
      })
    }
  }, 1000)
}

export default useArticleStompClient
