import { type TabContextMenuProps } from '@/components/system/tap_system/TabContextMenu'
import { atom } from 'jotai'

export const TabContextManagerAtom = atom<TabContextMenuProps | null>(null)
