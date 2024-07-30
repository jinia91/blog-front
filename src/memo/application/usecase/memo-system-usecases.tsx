import { useAtom } from 'jotai'
import { memoEditorContextAtom, memoSystemContextAtom } from '@/memo/infra/atom/memo-system-context-atom'
import { type MemoSystemNavigatorContext } from '@/memo/application/domain/memo-system-navigator-context'
import { type MemoEditorSharedContext } from '@/memo/application/domain/memo-editor-shared-context'

export const useMemoSystem = (): {
  navigatorContext: MemoSystemNavigatorContext
  memoEditorSharedContext: MemoEditorSharedContext
  setMemoEditorSharedContext: (context: MemoEditorSharedContext) => void
  toggleReferenceMode: () => void
  setMemoTitle: (title: string) => void
  refreshReference: () => void
} => {
  const [navigatorContext, setNavigatorContext] = useAtom(memoSystemContextAtom)
  const [memoEditorSharedContext, setMemoEditorSharedContextAtom] = useAtom(memoEditorContextAtom)

  const toggleReferenceMode = (): void => {
    const toggledContext = {
      isReferenceMode: !navigatorContext.isReferenceMode,
      refreshTrigger: navigatorContext.refreshTrigger
    }
    setNavigatorContext(toggledContext)
  }

  const refreshReference = (): void => {
    const refreshTrigger = navigatorContext.refreshTrigger + 1
    setNavigatorContext({ ...navigatorContext, refreshTrigger })
  }

  const setMemoTitle = (title: string): void => {
    setMemoEditorSharedContext({ ...memoEditorSharedContext, title })
  }

  const setMemoEditorSharedContext = (context: MemoEditorSharedContext): void => {
    setMemoEditorSharedContextAtom(context)
  }

  return {
    navigatorContext,
    memoEditorSharedContext,
    toggleReferenceMode,
    setMemoTitle,
    setMemoEditorSharedContext,
    refreshReference
  }
}
