import React, { useCallback, useEffect, useRef } from 'react'
import { TabItem } from '@/components/ui-layout/tap_system/TabItem'
import { useTabs } from '@/system/application/usecase/TabUseCases'
import { useContextMenu } from '@/system/application/usecase/ContextMenuUseCases'

export function TabBar (): React.ReactElement {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { tabs, selectedTabIdx, selectTab, moveTabTo } = useTabs()
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
      selectTab(index)
    }
  }

  const handleDrop = (droppedIndex: number): void => {
    moveTabTo(selectedTabIdx, droppedIndex)
  }

  useEffect(() => {
    function ensureTabInView (): void {
      if (scrollContainerRef.current != null) {
        const container = scrollContainerRef.current
        const selectedTabElement = container.children[selectedTabIdx] as HTMLDivElement

        if (selectedTabElement != null) {
          const containerWidth = container.offsetWidth
          const containerScrollLeft = container.scrollLeft
          const selectedTabOffset = selectedTabElement.offsetLeft
          const selectedTabWidth = selectedTabElement.offsetWidth

          const selectedTabEnd = selectedTabOffset + selectedTabWidth
          const containerEnd = containerScrollLeft + containerWidth

          if (selectedTabOffset < containerScrollLeft) {
            container.scrollLeft = selectedTabOffset
          } else if (selectedTabEnd > containerEnd) {
            container.scrollLeft = selectedTabEnd - containerWidth
          }
        }
      }
    }

    ensureTabInView()
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
