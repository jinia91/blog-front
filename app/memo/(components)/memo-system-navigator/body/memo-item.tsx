import { type SimpleMemoInfo } from '../../../(domain)/memo'
import React, { useState } from 'react'
import Image from 'next/image'
import memoImg from '../../../../../public/memo.png'
import { type ContextMenuProps } from './memo-folder-context-menu'
import { useFolderAndMemo } from '../../../(usecase)/memo-folder-usecases'
import { useMemoSystem } from '../../../(usecase)/memo-system-usecases'

export default function MemoItem ({ memo, parentFolderId, handleContextMenu, depth, contextMenu }: {
  memo: SimpleMemoInfo
  parentFolderId: number | null
  handleContextMenu: (e: React.MouseEvent<HTMLLIElement>, memoId?: string, folderId?: string) => void
  depth: number
  contextMenu: ContextMenuProps | null
}): React.ReactElement {
  const { memoEditorSharedContext } = useMemoSystem()
  const [isDragOver, setIsDragOver] = useState(false)
  const { makeRelationshipAndRefresh } = useFolderAndMemo()
  const handleDragStart = (e: React.DragEvent, draggedItem: any): void => {
    e.dataTransfer.setData('application/reactflow', JSON.stringify(draggedItem))
    e.dataTransfer.effectAllowed = 'move'
  }
  const handleDrop = async (e: React.DragEvent, targetFolderId: number | null): Promise<void> => {
    e.preventDefault()
    setIsDragOver(false)
    const draggedItem: { id: number, type: string } = JSON.parse(e.dataTransfer.getData('application/reactflow'))
    await makeRelationshipAndRefresh(draggedItem, targetFolderId)
  }

  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent): void => {
    e.preventDefault()
    setIsDragOver(false)
  }

  function determineMemoText (memo: SimpleMemoInfo, underwritingId: string | null | undefined, newMemoTitle: string | null): string | null {
    if (memo.id.toString() === underwritingId) {
      return newMemoTitle?.length === 0 ? 'Untitled' : newMemoTitle
    } else {
      return memo.title.length === 0 ? 'Untitled' : memo.title
    }
  }

  return (
    <li
      draggable={true}
      onDragStart={(e) => {
        handleDragStart(e, { id: memo.id, type: 'memo' })
      }}
      onDrop={(e) => {
        handleDrop(e, parentFolderId).catch(error => {
          console.error(error)
        })
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onContextMenu={(e) => {
        handleContextMenu(e, memo.id.toString())
      }}
      data-memo-id={memo.id.toString()}
      className={`
      pl-2 flex items-center pr-2 py-1 rounded cursor-pointer truncate h-8 hover:bg-gray-500
      ${isDragOver ? 'bg-gray-500' : ''}
      ${memo.id.toString() === memoEditorSharedContext.id ? 'bg-gray-600' : 'hover:bg-gray-500'}
      ${(contextMenu != null) && contextMenu.memoId === memo.id.toString() ? 'bg-gray-600' : ''}
      `}
    >
      <div
        className={'flex items-center'}
        style={{ marginLeft: `${(depth + 1) * 20}px` }}
      >
        <Image src={memoImg} alt={'memo'} width={20} height={10}/>
        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-argument */}
        <span
          className="ml-2">{determineMemoText(memo, memoEditorSharedContext.id, memoEditorSharedContext.title)}</span>
      </div>
    </li>
  )
};
