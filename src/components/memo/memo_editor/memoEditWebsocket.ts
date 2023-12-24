import { useEffect, useState } from 'react'
import SockJS from 'sockjs-client'
import { type Client, type CompatClient, Stomp } from '@stomp/stompjs'
import { useDebouncedCallback } from 'use-debounce'

const useStompClient = (memoId: string, title: string, content: string): void => {
  const [stompClient, setStompClient] = useState<Client | null>(null)

  useEffect(() => {
    let client: CompatClient | null = null
    const connectStompClient = (): void => {
      const socket = new SockJS('http://localhost:7777/memo')
      client = Stomp.over(socket)

      client.connect({}, () => {
        setStompClient(client)
      }, () => {
        setStompClient(null)
        setTimeout(connectStompClient, 5000)
      })
    }

    connectStompClient()

    return () => {
      if (client != null) {
        client.disconnect()
      }
    }
  }, [])

  useEffect(() => {
    debouncedUpdateMemo()
  }, [title, content])

  const debouncedUpdateMemo = useDebouncedCallback(() => {
    if ((stompClient != null) && (memoId !== '')) {
      const command = {
        type: 'UpdateMemo',
        id: memoId,
        title,
        content
      }

      stompClient.publish({
        destination: '/app/updateMemo',
        body: JSON.stringify(command)
      })
    }
  }, 300)
  
  const debouncedUpdateReferences = useDebouncedCallback((references) => {
    if ((stompClient != null) && (memoId !== '')) {
      const command = {
        type: 'UpdateReferences',
        id: memoId,
        references
      }

      stompClient.publish({
        destination: '/app/updateReferences',
        body: JSON.stringify(command)
      })
    }
  }
}

export default useStompClient
