import { useAtom } from 'jotai'
import { memoEditorContextAtom } from '@/memo/infra/atom/memo-editor-context-atom'
import { type MemoEditorContext } from '@/memo/application/domain/memo-editor-context'

export const useMemoEditor = (): {
  editContext: (newContext: MemoEditorContext) => void
  memoEditorContext: MemoEditorContext
} => {
  const [memoEditorContext, setMemoEditorContext] = useAtom(memoEditorContextAtom)

  const editContext = (newContext: MemoEditorContext): void => {
    setMemoEditorContext(newContext)
  }
  return {
    editContext, memoEditorContext
  }
}
