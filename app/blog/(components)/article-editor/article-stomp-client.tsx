import { useEffect, useState } from 'react'
import SockJS from 'sockjs-client'
import { type Client, type CompatClient, type IMessage, Stomp } from '@stomp/stompjs'
import { useDebouncedCallback } from 'use-debounce'

const useArticleStompClient = (
  articleId: string,
  articleTitle: string,
  articleContent: string,
  thumbnail: string
): void => {
  const [stompClient, setStompClient] = useState<Client | null>(null)

  useEffect(() => {
    let client: CompatClient | null = null
    const connectStompClient = (): void => {
      const socket = new SockJS(process.env.NEXT_PUBLIC_HOST + '/ws')
      client = Stomp.over(socket)

      client.connect({}, () => {
        setStompClient(client)
        if (client === null) {
          return
        }
        client.subscribe('/topic/articleResponse', (message: IMessage) => {
          //   consume
        })
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
