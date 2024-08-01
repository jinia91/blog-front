import { atom, useAtom } from 'jotai'
import { type MemoSystemNavigatorContext } from '../(domain)/memo-system-navigator-context'
import { type MemoEditorSharedContext } from '../(domain)/memo-editor-shared-context'

const memoSystemContextAtom = atom<MemoSystemNavigatorContext>({ isReferenceMode: false, refreshTrigger: 0 })
const memoEditorContextAtom = atom<MemoEditorSharedContext>({ title: '', id: '' })

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
