'use client'
import { useEffect } from 'react'
import { fetchMemoById } from '@/memo/infra/api/memo'
import { type Memo, type ReferenceInfo } from '@/memo/application/domain/models'
import { type MemoEditorSharedContext } from '@/memo/application/domain/memo-editor-shared-context'

export const useFetchMemo = (
  pageMemoNumber: string,
  setMemo: (memo: Memo) => void,
  setMemoEditorContext: (memoEditorSharedContext: MemoEditorSharedContext) => void,
  setContent: (content: string) => void,
  setReferences: (references: ReferenceInfo[]) => void
): void => {
  useEffect(() => {
    async function fetchData (): Promise<void> {
      try {
        const fetchedMemo = await fetchMemoById(pageMemoNumber)
        if (fetchedMemo != null) {
          setMemo(fetchedMemo)
          setMemoEditorContext({ id: fetchedMemo.memoId.toString(), title: fetchedMemo.title })
          setContent(fetchedMemo.content)
          setReferences(fetchedMemo.references)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    void fetchData()
  }, [pageMemoNumber, setMemo, setContent])
}

export default useFetchMemo
