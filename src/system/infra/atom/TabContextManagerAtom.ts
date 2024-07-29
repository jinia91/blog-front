import { type TabContextMenuProps } from '@/components/ui-layout/tap_system/TabContextMenu'
import { atom } from 'jotai'

export const TabContextManagerAtom = atom<TabContextMenuProps | null>(null)
