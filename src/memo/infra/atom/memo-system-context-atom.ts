import { atom } from 'jotai'
import { type MemoSystemNavigatorContext } from '@/memo/application/domain/memo-system-navigator-context'
import type { MemoEditorSharedContext } from '@/memo/application/domain/memo-editor-shared-context'

export const memoSystemContextAtom = atom<MemoSystemNavigatorContext>({ isReferenceMode: false, refreshTrigger: 0 })

export const memoEditorContextAtom = atom<MemoEditorSharedContext>({ title: '', id: '' })
