import { useEffect } from 'react'
import { fetchMemoById } from '@/api/memo'
import { type Memo } from '@/api/models'

export const useFetchMemo = (
  pageMemoNumber: string,
  setMemo: (memo: Memo) => void,
  setTitle: (title: string) => void,
  setMemoId: (memoId: string) => void,
  setContent: (content: string) => void
): void => {
  useEffect(() => {
    async function fetchData (): Promise<void> {
      try {
        const fetchedMemo = await fetchMemoById(pageMemoNumber)

        if (fetchedMemo != null) {
          setMemo(fetchedMemo)
          setTitle(fetchedMemo.title)
          setMemoId(fetchedMemo.memoId.toString())
          setContent(fetchedMemo.content)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    void fetchData()
  }, [pageMemoNumber, setMemo, setTitle, setMemoId, setContent])
}

export default useFetchMemo
