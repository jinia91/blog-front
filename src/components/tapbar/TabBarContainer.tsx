import React, { useContext, useEffect, useRef } from 'react'
import { type Tab, TabItem } from '@/components/tapbar/TabItem'
import { TabBarContext } from '@/components/DynamicLayout'

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

  return (
    <div className="flex overflow-hidden space-x-2" style={{ zIndex: 1 }}>
      <div ref={scrollContainerRef} className="flex space-x-1 overflow-x-auto">
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
