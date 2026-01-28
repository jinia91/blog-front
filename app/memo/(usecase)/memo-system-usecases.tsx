import { atom, useAtom } from 'jotai'
import { useCallback } from 'react'
import { type MemoSystemNavigatorContext, NavigatorContextType } from '../(domain)/memo-system-navigator-context'
import { type MemoEditorSharedContext } from '../(domain)/memo-editor-shared-context'

const memoSystemContextAtom = atom<MemoSystemNavigatorContext>({
  type: NavigatorContextType.NORMAL_MODE,
  refreshTrigger: 0
})
const memoEditorContextAtom = atom<MemoEditorSharedContext>({ title: '', id: '' })

export const useMemoSystem = (): {
  navigatorContext: MemoSystemNavigatorContext
  memoEditorSharedContext: MemoEditorSharedContext
  setMemoEditorSharedContext: (context: MemoEditorSharedContext) => void
  toggleReferenceMode: () => void
  toggleSearchMode: () => void
  setMemoTitle: (title: string) => void
  refreshReference: () => void
} => {
  const [navigatorContext, setNavigatorContext] = useAtom(memoSystemContextAtom)
  const [memoEditorSharedContext, setMemoEditorSharedContextAtom] = useAtom(memoEditorContextAtom)

  const toggleReferenceMode = useCallback((): void => {
    setNavigatorContext(prev => ({
      type: prev.type === NavigatorContextType.REFERENCE_MODE ? NavigatorContextType.NORMAL_MODE : NavigatorContextType.REFERENCE_MODE,
      refreshTrigger: prev.refreshTrigger
    }))
  }, [setNavigatorContext])

  const toggleSearchMode = useCallback((): void => {
    setNavigatorContext(prev => ({
      type: prev.type === NavigatorContextType.SEARCH_MODE ? NavigatorContextType.NORMAL_MODE : NavigatorContextType.SEARCH_MODE,
      refreshTrigger: prev.refreshTrigger
    }))
  }, [setNavigatorContext])

  const refreshReference = useCallback((): void => {
    setNavigatorContext(prev => ({ ...prev, refreshTrigger: prev.refreshTrigger + 1 }))
  }, [setNavigatorContext])

  const setMemoTitle = useCallback((title: string): void => {
    setMemoEditorSharedContextAtom(prev => ({ ...prev, title }))
  }, [setMemoEditorSharedContextAtom])

  const setMemoEditorSharedContext = useCallback((context: MemoEditorSharedContext): void => {
    setMemoEditorSharedContextAtom(context)
  }, [setMemoEditorSharedContextAtom])

  return {
    navigatorContext,
    memoEditorSharedContext,
    toggleReferenceMode,
    toggleSearchMode,
    setMemoTitle,
    setMemoEditorSharedContext,
    refreshReference
  }
}
