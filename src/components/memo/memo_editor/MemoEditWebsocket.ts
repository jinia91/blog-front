import { useContext, useEffect, useState } from 'react'
import SockJS from 'sockjs-client'
import { type Client, type CompatClient, type IMessage, Stomp } from '@stomp/stompjs'
import { useDebouncedCallback } from 'use-debounce'
import { type ReferenceInfo } from '@/api/models'
import { ReferenceModeContext } from '@/components/memo/MemoEditContextProvider'

const useStompClient = (
  memoId: string,
  title: string,
  content: string,
  references: ReferenceInfo[],
  setReferences: (references: ReferenceInfo[]) => void
): void => {
  const [stompClient, setStompClient] = useState<Client | null>(null)
  const { setRefreshCount }: {
    setRefreshCount: (refreshCount: (currentCount: number) => any) => void
  } = useContext(ReferenceModeContext)
  useEffect(() => {
    let client: CompatClient | null = null
    const connectStompClient = (): void => {
      const socket = new SockJS('http://localhost:7777/memo')
      client = Stomp.over(socket)

      client.connect({}, () => {
        setStompClient(client)
        if (client == null) {
          return
        }
        client.subscribe('/topic/memoResponse', (message: IMessage) => {
          //   consume
        })
        client.subscribe('/topic/memoResponse/updateReferences', (message) => {
          setRefreshCount((currentCount) => currentCount + 1)
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
    debouncedUpdateReferences()
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
      stompClient.publish({
        destination: '/app/updateReferences',
        body: JSON.stringify(command)
      })
    }
  }, 3000)
}

export default useStompClient
