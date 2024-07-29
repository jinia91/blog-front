import React, { useState } from 'react'
import Link from 'next/link'
import { type Tab } from '@/system/application/domain/Tab'

export function TabItem ({ tab, index, isSelected, onSelectTab, onRemoveTab, onContextMenu, onDragStart, onDrop }: {
  tab: Tab
  index: number
  isSelected: boolean
  onSelectTab: (index: number) => void
  onRemoveTab: (index: number) => void
  onContextMenu: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => void
  onDragStart: any
  onDrop: (e: React.DragEvent, index: number) => void
}): React.ReactElement {
  const [isDragOver, setIsDragOver] = useState(false)
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
        href={tab.context}
        onClick={() => {
          onSelectTab(index)
        }}
        className={`flex items-center justify-center p-2 rounded-t-lg
        ${isSelected ? 'bg-gray-700' : isDragOver ? 'bg-gray-700' : 'bg-gray-900'} hover:bg-gray-700 cursor-pointer
        `}
      >
      <span className={`dos-font truncate ${isSelected ? 'text-white' : 'text-gray-300'}`}>
        {tab.name}
      </span>
      </Link>
      <button
        onClick={() => {
          onRemoveTab(index)
        }}
        className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center w-3 h-3"
        style={{ transform: 'translate(-50%, 50%)' }}
      />
    </div>
  )
}
