'use client'
import { useEffect } from 'react'
import { fetchMemoById } from '../../(infra)/memo'
import { type Memo, type ReferenceInfo } from '../../(domain)/memo'
import { type MemoEditorSharedContext } from '../../(domain)/memo-editor-shared-context'

export const useEffectFetchMemo = (
  pageMemoId: string,
  setMemo: (memo: Memo) => void,
  setMemoEditorContext: (memoEditorSharedContext: MemoEditorSharedContext) => void,
  setContent: (content: string) => void,
  setReferences: (references: ReferenceInfo[]) => void
): void => {
  useEffect(() => {
    async function fetchData (): Promise<void> {
      try {
        const fetchedMemo = await fetchMemoById(pageMemoId)
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
  }, [pageMemoId, setMemo, setContent])
}
