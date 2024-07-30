import { atom, useAtom } from 'jotai'
import { type MemoSystemNavigatorContext } from '@/memo/application/domain/memo-system-navigator-context'
import { type MemoEditorSharedContext } from '@/memo/application/domain/memo-editor-shared-context'

const memoSystemContextAtom = atom<MemoSystemNavigatorContext>({ isReferenceMode: false })

const refreshTriggerAtom = atom<number>(0)

const memoEditorContextAtom = atom<MemoEditorSharedContext>({ title: '', id: '' })

export const useMemoSystem = (): {
  navigatorContext: MemoSystemNavigatorContext
  memoEditorSharedContext: MemoEditorSharedContext
  setMemoEditorSharedContext: (context: MemoEditorSharedContext) => void
  toggleReferenceMode: () => void
  setMemoTitle: (title: string) => void
  refreshListener: number
  refreshTrigger: () => void
} => {
  const [navigatorContext, setNavigatorContext] = useAtom(memoSystemContextAtom)
  const [memoEditorSharedContext, setMemoEditorSharedContextAtom] = useAtom(memoEditorContextAtom)
  const [refreshListener, setRefresh] = useAtom(refreshTriggerAtom)

  const refreshTrigger = (): void => {
    setRefresh((prev) => prev + 1)
  }

  const toggleReferenceMode = (): void => {
    const toggledContext = {
      isReferenceMode: !navigatorContext.isReferenceMode
    }
    setNavigatorContext(toggledContext)
  }

  const setMemoTitle = (title: string): void => {
    setMemoEditorSharedContext({ ...memoEditorSharedContext, title })
  }

  const setMemoEditorSharedContext = (context: MemoEditorSharedContext): void => {
    setMemoEditorSharedContextAtom(context)
  }

  return {
    refreshListener,
    refreshTrigger,
    navigatorContext,
    memoEditorSharedContext,
    toggleReferenceMode,
    setMemoTitle,
    setMemoEditorSharedContext
  }
}
