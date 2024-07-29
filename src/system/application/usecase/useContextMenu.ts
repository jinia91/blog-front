import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { type TabContextMenuProps } from '@/components/ui-layout/tap_system/TabContextMenu'
import { type Tab } from '@/system/application/domain/Tab'

export function useContextMenu ({ setTabs, setSelectedTabIdx, removeTab }: {
  setTabs: (React.Dispatch<React.SetStateAction<Tab[]>>)
  setSelectedTabIdx: React.Dispatch<React.SetStateAction<number>>
  removeTab: (target: number) => void
}): {
    contextMenu: TabContextMenuProps | null
    closeContextMenu: () => void
    handleContextMenu: (event: React.MouseEvent<HTMLDivElement>, idx: number) => void
    closeAllTabs: () => void
    closeOtherTabs: () => void
    removeTabCallback: () => void
  } {
  const [contextMenu, setContextMenu] = useState<TabContextMenuProps | null>(null)

  const closeContextMenu = useCallback(() => {
    setContextMenu(null)
  }, [])

  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement>, idx: number) => {
    event.preventDefault()
    setContextMenu({
      xPos: `${event.pageX}px`,
      yPos: `${event.pageY}px`,
      tabIdx: idx
    })
  }, [])

  const closeAllTabs = useCallback(() => {
    setTabs([])
    setSelectedTabIdx(0)
  }, [setTabs, setSelectedTabIdx])

  const closeOtherTabs = useCallback(() => {
    if (contextMenu !== null) {
      setTabs(tabs => tabs.filter((_, idx) => idx === contextMenu.tabIdx))
      setSelectedTabIdx(0)
    }
  }, [setTabs, setSelectedTabIdx, contextMenu])

  const removeTabCallback = useCallback(() => {
    if (contextMenu !== null) {
      removeTab(contextMenu.tabIdx)
    }
  }, [removeTab, contextMenu])

  useEffect(() => {
    document.addEventListener('click', closeContextMenu)
    return () => {
      document.removeEventListener('click', closeContextMenu)
    }
  }, [closeContextMenu])

  return {
    contextMenu,
    closeContextMenu,
    handleContextMenu,
    closeAllTabs,
    closeOtherTabs,
    removeTabCallback
  }
}
