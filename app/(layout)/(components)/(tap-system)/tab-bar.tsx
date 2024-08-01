import React, { useEffect, useRef } from 'react'
import { TabItem } from './tab-item'
import { useTabBarAndRouter } from '../../(usecase)/tab-usecases'
import { ensureFocusInHorizontalView } from './ui-controll-utils'

export function TabBar (): React.ReactElement {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { tabs, selectedTabIdx, selectTab, moveSelectedTabTo } = useTabBarAndRouter()

  useEffect(() => {
    ensureFocusInHorizontalView(scrollContainerRef, selectedTabIdx)
  }, [selectedTabIdx, tabs])

  useEffect(() => {
    const moveTab = async (event: KeyboardEvent): Promise<void> => {
      if (event.metaKey && (event.key === 'ArrowLeft')) {
        const newSelectedIdx = selectedTabIdx > 0 ? selectedTabIdx - 1 : 0
        selectTab(newSelectedIdx)
      }
      if (event.metaKey && (event.key === 'ArrowRight')) {
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

  const handleDragStart = (index: number): void => {
    if (index !== selectedTabIdx) {
      selectTab(index)
    }
  }

  const handleDrop = (droppedIndex: number): void => {
    moveSelectedTabTo(droppedIndex)
  }

  return (
    <div className="flex overflow-hidden">
      <div ref={scrollContainerRef} className="flex space-x-1 overflow-scroll scrollbar-hidden">
        {tabs.map((tab, idx) => (
          <TabItem
            tab={tab}
            index={idx}
            isSelected={idx === selectedTabIdx}
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
