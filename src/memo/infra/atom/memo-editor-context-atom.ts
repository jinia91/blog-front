import { type MemoEditorContext } from '@/memo/application/domain/memo-editor-context'
import { atom } from 'jotai'

export const memoEditorContextAtom = atom<MemoEditorContext>({ title: '', id: '' })
