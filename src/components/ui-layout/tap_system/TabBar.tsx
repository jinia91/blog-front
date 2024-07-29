import React, { useCallback, useEffect, useRef } from 'react'
import { TabItem } from '@/components/ui-layout/tap_system/TabItem'
import { useTabs } from '@/system/application/usecase/TabUseCases'
import { useContextMenu } from '@/system/application/usecase/useContextMenu'

export function TabBar ({ onSelectTab, onRemoveTab }: {
  onSelectTab: (index: number) => void
  onRemoveTab: (index: number) => void
}): React.ReactElement {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { tabs, selectedTabIdx, setTabs, selectTab } = useTabs()
  const { closeContextMenu, setContextMenu } = useContextMenu()

  const onContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement>, idx: number) => {
    event.preventDefault()
    setContextMenu({
      xPos: `${event.pageX}px`,
      yPos: `${event.pageY}px`,
      tabIdx: idx
    })
  }, [])

  useEffect(() => {
    document.addEventListener('click', closeContextMenu)
    return () => {
      document.removeEventListener('click', closeContextMenu)
    }
  }, [closeContextMenu])

  const handleDragStart = (index: number): void => {
    if (index !== selectedTabIdx) {
      onSelectTab(index)
    }
  }

  const handleDrop = (droppedIndex: number): void => {
    const newTabs = [...tabs]
    const draggedTab = newTabs[selectedTabIdx]
    newTabs.splice(selectedTabIdx, 1)
    newTabs.splice(droppedIndex, 0, draggedTab)

    setTabs(newTabs)
    selectTab(droppedIndex)
  }

  useEffect(() => {
    if (scrollContainerRef.current != null) {
      const containerWidth = scrollContainerRef.current.offsetWidth
      const selectedTabElement = scrollContainerRef.current.children[selectedTabIdx] as HTMLDivElement

      if (selectedTabElement != null) {
        const selectedTabOffset = selectedTabElement.offsetLeft
        const selectedTabWidth = selectedTabElement.offsetWidth
        scrollContainerRef.current.scrollLeft = selectedTabOffset - (containerWidth / 2) + (selectedTabWidth / 2)
      }
    }
  }, [selectedTabIdx, tabs])

  useEffect(() => {
    const moveTab = async (event: KeyboardEvent): Promise<void> => {
      if (event.metaKey && (event.key === 'ArrowLeft')) {
        event.preventDefault()
        const newSelectedIdx = selectedTabIdx > 0 ? selectedTabIdx - 1 : 0
        selectTab(newSelectedIdx)
      }
      if (event.metaKey && (event.key === 'ArrowRight')) {
        event.preventDefault()
        const newSelectedIdx = selectedTabIdx < tabs.length - 1 ? selectedTabIdx + 1 : selectedTabIdx
        selectTab(newSelectedIdx)
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    window.addEventListener('keydown', moveTab)

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      window.removeEventListener('keydown', moveTab)
    }
  }, [selectedTabIdx, tabs])

  return (
    <div className="flex overflow-hidden">
      <div ref={scrollContainerRef} className="flex space-x-1 overflow-scroll scrollbar-hidden">
        {tabs.map((tab, idx) => (
          <TabItem
            tab={tab}
            index={idx}
            isSelected={idx === selectedTabIdx}
            onSelectTab={onSelectTab}
            onRemoveTab={onRemoveTab}
            onContextMenu={onContextMenu}
            onDragStart={() => {
              handleDragStart(idx)
            }}
            onDrop={() => {
              handleDrop(idx)
            }}
            key={idx}
          />
        ))}
      </div>
    </div>
  )
}
