import { type Folder } from '@/memo/application/domain/models'
import { atom } from 'jotai'

export const folderAtom = atom<Folder[]>([])
