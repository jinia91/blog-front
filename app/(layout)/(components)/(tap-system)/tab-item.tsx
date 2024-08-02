import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { type Tab } from '../../(domain)/tab'
import { useTabBarAndRouter } from '../../(usecase)/tab-usecases'
import { useContextMenu } from '../../(usecase)/tab-context-menu-usecases'

export function TabItem ({ tab, index, isSelected, onDragStart, onDrop }: {
  tab: Tab
  index: number
  isSelected: boolean
  onDragStart: any
  onDrop: (e: React.DragEvent, index: number) => void
}): React.ReactElement {
  const [isDragOver, setIsDragOver] = useState(false)
  const { selectTab, closeTab } = useTabBarAndRouter()
  const { contextMenu, closeContextMenu, setContextMenu } = useContextMenu()

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

  const handleDragOver = (e: React.DragEvent): void => {
    setIsDragOver(true)
    e.preventDefault()
  }
  const handleDragLeave = (e: React.DragEvent): void => {
    setIsDragOver(false)
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, index: number): void => {
    setIsDragOver(false)
    onDrop(e, index)
    e.preventDefault()
  }

  return (
    <div
      onContextMenu={(e) => {
        onContextMenu(e, index)
      }}
      className={'flex-shrink-0 w-48 relative'}
    >
      <Link
        draggable={true}
        onDragStart={onDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={(e) => {
          handleDrop(e, index)
        }}
        href={tab.urlPath}
        onClick={() => {
          selectTab(index)
        }}
        className={`flex items-center justify-center p-2 rounded-t-lg
        ${isSelected ? 'bg-gray-700' : (isDragOver || contextMenu?.tabIdx === index) ? 'bg-gray-600' : 'bg-gray-900'} hover:bg-gray-700 cursor-pointer
        `}
      >
      <span className={`dos-font truncate ${isSelected ? 'text-white' : 'text-gray-300'}`}>
        {tab.name}
      </span>
      </Link>
      <button
        onClick={() => {
          closeTab(index)
        }}
        className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center w-3 h-3"
        style={{ transform: 'translate(-50%, 50%)' }}
      />
    </div>
  )
}
