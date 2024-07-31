import { type TabContextMenuProps } from '../(components)/(tap-system)/tab-context-menu'
import { useTabBarAndRouter } from './tab-usecases'
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
    closeOtherTabsWithOut
  } = useTabBarAndRouter()
  const [contextMenu, setContextMenu] = useAtom(TabContextManagerAtom)

  const closeContextMenu = (): void => {
    setContextMenu(null)
  }

  const closeOtherTabs = (): void => {
    if (contextMenu == null) {
      return
    }

    closeOtherTabsWithOut(tabs[contextMenu.tabIdx])
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
