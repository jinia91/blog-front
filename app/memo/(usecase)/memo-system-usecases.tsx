import { atom, useAtom } from 'jotai'
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

  const toggleReferenceMode = (): void => {
    const toggledContext = {
      type: navigatorContext.type === NavigatorContextType.REFERENCE_MODE ? NavigatorContextType.NORMAL_MODE : NavigatorContextType.REFERENCE_MODE,
      refreshTrigger: navigatorContext.refreshTrigger
    }
    setNavigatorContext(toggledContext)
  }

  const toggleSearchMode = (): void => {
    const toggledContext = {
      type: navigatorContext.type === NavigatorContextType.SEARCH_MODE ? NavigatorContextType.NORMAL_MODE : NavigatorContextType.SEARCH_MODE,
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
    toggleSearchMode,
    setMemoTitle,
    setMemoEditorSharedContext,
    refreshReference
  }
}
