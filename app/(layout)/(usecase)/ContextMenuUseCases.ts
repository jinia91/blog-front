import { type TabContextMenuProps } from '../(components)/(tap-system)/TabContextMenu'
import { useTabs } from './TabUseCases'
import { atom, useAtom } from 'jotai'

const TabContextManagerAtom = atom<TabContextMenuProps | null>(null)

export function useContextMenu (): {
  contextMenu: TabContextMenuProps | null
  closeContextMenu: () => void
  closeAllTabs: () => void
  closeOtherTabs: () => void
  removeThisTab: () => void
  setContextMenu: (contextMenu: TabContextMenuProps | null) => void
} {
  const {
    tabs,
    removeTab,
    removeAllTabs,
    closeOtherTabsWith
  } = useTabs()
  const [contextMenu, setContextMenu] = useAtom(TabContextManagerAtom)

  const closeContextMenu = (): void => {
    setContextMenu(null)
  }

  const closeOtherTabs = (): void => {
    if (contextMenu == null) {
      return
    }

    closeOtherTabsWith(tabs[contextMenu.tabIdx])
  }

  const closeAllTabs = (): void => {
    removeAllTabs()
  }

  const removeThisTab = (): void => {
    if (contextMenu != null) {
      removeTab(contextMenu.tabIdx)
    }
  }

  return {
    contextMenu,
    closeContextMenu,
    closeAllTabs,
    closeOtherTabs,
    removeThisTab,
    setContextMenu
  }
}
