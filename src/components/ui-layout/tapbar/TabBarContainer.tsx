import React, { useContext, useEffect, useRef } from 'react'
import { type Tab, TabItem } from '@/components/ui-layout/tapbar/TabItem'
import { TabBarContext } from '@/components/ui-layout/main/DynamicLayout'

export function TabContainer ({ onSelectTab, onRemoveTab, onContextMenu }: {
  onSelectTab: (index: number) => void
  onRemoveTab: (index: number) => void
  onContextMenu: (event: React.MouseEvent<HTMLDivElement>, index: number) => void
}): React.ReactElement {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { tabs, selectedTabIdx, setTabs, setSelectedTabIdx }: {
    tabs: Tab[]
    selectedTabIdx: number
    setTabs: (tabs: Tab[]) => void
    setSelectedTabIdx: (index: number) => void
  } = useContext(TabBarContext)

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
    setSelectedTabIdx(droppedIndex)
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
        setSelectedTabIdx(newSelectedIdx)
      }
      if (event.metaKey && (event.key === 'ArrowRight')) {
        event.preventDefault()
        const newSelectedIdx = selectedTabIdx < tabs.length - 1 ? selectedTabIdx + 1 : selectedTabIdx
        setSelectedTabIdx(newSelectedIdx)
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
