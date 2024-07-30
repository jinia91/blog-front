import { type FolderInfo } from '@/memo/application/domain/models'
import { atom } from 'jotai'

export const folderAtom = atom<FolderInfo[]>([])
