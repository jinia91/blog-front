import { type Tab } from '@/system/application/domain/Tab'
import { atom } from 'jotai'

export const TabsAtom = atom<Tab[]>([])

export const SelectedTabIdxAtom = atom<number>(0)
