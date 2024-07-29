import { type TabContextMenuProps } from '@/components/system/tap_system/TabContextMenu'
import { useTabs } from '@/system/application/usecase/TabUseCases'
import { useAtom } from 'jotai'
import { TabContextManagerAtom } from '@/system/infra/atom/TabContextManagerAtom'

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
    selectedTabIdx,
    selectTab,
    removeTab,
    setTabs
  } = useTabs()

  const [contextMenu, setContextMenu] = useAtom(TabContextManagerAtom)

  const closeContextMenu = (): void => {
    setContextMenu(null)
  }

  const closeOtherTabs = (): void => {
    const newTabs = [tabs[selectedTabIdx]]
    setTabs(newTabs)
    selectTab(0)
  }

  const closeAllTabs = (): void => {
    setTabs([])
    selectTab(0)
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
