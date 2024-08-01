import { type TabContextMenuProps } from '../(components)/(tap-system)/tab-context-menu'
import { atom, useAtom } from 'jotai'

const TabContextManagerAtom = atom<TabContextMenuProps | null>(null)

export function useContextMenu (): {
  contextMenu: TabContextMenuProps | null
  closeContextMenu: () => void
  setContextMenu: (contextMenu: TabContextMenuProps | null) => void
} {
  const [contextMenu, setContextMenu] = useAtom(TabContextManagerAtom)

  const closeContextMenu = (): void => {
    setContextMenu(null)
  }

  return {
    contextMenu,
    closeContextMenu,
    setContextMenu
  }
}
