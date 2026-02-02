import { type SimpleMemoInfo } from '../../../(domain)/memo'
import React, { useState } from 'react'
import Image from 'next/image'
import memoImg from '../../../../../public/memo.png'
import { type ContextMenuProps } from './memo-folder-context-menu'
import { useFolderAndMemo } from '../../../(usecase)/memo-folder-usecases'
import { useMemoSystem } from '../../../(usecase)/memo-system-usecases'

type DropPosition = 'before' | 'after' | null

export default function MemoItem ({ memo, parentFolderId, handleContextMenu, depth, contextMenu, siblingMemos, memoIndex }: {
  memo: SimpleMemoInfo
  parentFolderId: number | null
  handleContextMenu: (e: React.MouseEvent<HTMLLIElement>, memoId?: string, folderId?: string) => void
  depth: number
  contextMenu: ContextMenuProps | null
  siblingMemos?: SimpleMemoInfo[]
  memoIndex?: number
}): React.ReactElement {
  const { memoEditorSharedContext } = useMemoSystem()
  const [dropPosition, setDropPosition] = useState<DropPosition>(null)
  const { makeRelationshipAndRefresh, reorderMemoItem } = useFolderAndMemo()

  const handleDragStart = (e: React.DragEvent, draggedItem: any): void => {
    e.dataTransfer.setData('application/reactflow', JSON.stringify(draggedItem))
    // Also set memo-link data for editor drop
    e.dataTransfer.setData('application/memo-link', JSON.stringify({
      id: memo.id,
      title: memo.title
    }))
    e.dataTransfer.effectAllowed = 'move'
  }

  const getDropPosition = (e: React.DragEvent): DropPosition => {
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const height = rect.height

    if (y < height / 2) return 'before'
    return 'after'
  }

  const handleDrop = async (e: React.DragEvent, targetFolderId: number | null): Promise<void> => {
    e.preventDefault()
    e.stopPropagation()

    // 드롭 시점에 위치 직접 계산 (상태 의존 X)
    const currentDropPosition = getDropPosition(e)
    setDropPosition(null)

    const data = e.dataTransfer.getData('application/reactflow')
    if (data === '') return

    const draggedItem: { id: number, type: string } = JSON.parse(data)

    // 자기 자신에게 드롭 방지
    if (draggedItem.type === 'memo' && draggedItem.id === memo.id) {
      return
    }

    // 메모를 메모 위에 드롭
    if (draggedItem.type === 'memo') {
      // 같은 폴더 내의 메모인지 확인 (siblingMemos에 존재하는지)
      const isSameFolder = siblingMemos !== undefined &&
        siblingMemos.some(m => m.id === draggedItem.id)

      if (isSameFolder && memoIndex !== undefined && siblingMemos !== undefined) {
        // 같은 폴더 내 순서 변경
        // 드래그된 메모를 제외한 리스트에서 prev/next 계산
        const memosWithoutDragged = siblingMemos.filter(m => m.id !== draggedItem.id)
        const targetIndexInFiltered = memosWithoutDragged.findIndex(m => m.id === memo.id)

        if (targetIndexInFiltered === -1) {
          // 타겟을 찾지 못한 경우 (비정상 상황)
          return
        }

        const prevMemo = currentDropPosition === 'before'
          ? memosWithoutDragged[targetIndexInFiltered - 1]
          : memosWithoutDragged[targetIndexInFiltered]
        const nextMemo = currentDropPosition === 'before'
          ? memosWithoutDragged[targetIndexInFiltered]
          : memosWithoutDragged[targetIndexInFiltered + 1]

        const prevSequence = prevMemo?.sequence ?? null
        const nextSequence = nextMemo?.sequence ?? null

        await reorderMemoItem(draggedItem.id, prevSequence, nextSequence)
      } else {
        // 다른 폴더의 메모 → 이 폴더로 이동
        await makeRelationshipAndRefresh(draggedItem, targetFolderId)
      }
    } else if (draggedItem.type === 'folder') {
      // 폴더를 메모 위로 드래그 → 같은 부모 폴더로 이동
      await makeRelationshipAndRefresh(draggedItem, targetFolderId)
    }
  }

  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault()
    const position = getDropPosition(e)
    setDropPosition(position)
  }

  const handleDragLeave = (e: React.DragEvent): void => {
    e.preventDefault()
    setDropPosition(null)
  }

  function determineMemoText (memo: SimpleMemoInfo, underwritingId: string | null | undefined, newMemoTitle: string | null): string | null {
    if (memo.id.toString() === underwritingId) {
      return newMemoTitle?.length === 0 ? 'Untitled' : newMemoTitle
    } else {
      return memo.title.length === 0 ? 'Untitled' : memo.title
    }
  }

  const getDropIndicatorStyle = (): { className: string, style?: React.CSSProperties } => {
    if (dropPosition === 'before') {
      return {
        className: 'border-t-2 border-green-400',
        style: {
          background: 'linear-gradient(to bottom, rgba(74, 222, 128, 0.25) 0%, rgba(74, 222, 128, 0.1) 50%, transparent 50%)'
        }
      }
    }
    if (dropPosition === 'after') {
      return {
        className: 'border-b-2 border-green-400',
        style: {
          background: 'linear-gradient(to top, rgba(74, 222, 128, 0.25) 0%, rgba(74, 222, 128, 0.1) 50%, transparent 50%)'
        }
      }
    }
    return { className: '' }
  }

  const dropIndicator = getDropIndicatorStyle()

  return (
    <li
      draggable={true}
      onDragStart={(e) => {
        handleDragStart(e, { id: memo.id, type: 'memo' })
      }}
      onDrop={(e) => {
        handleDrop(e, parentFolderId).catch(error => {
          console.debug(error)
        })
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onContextMenu={(e) => {
        handleContextMenu(e, memo.id.toString())
      }}
      data-memo-id={memo.id.toString()}
      className={`
      pl-2 flex items-center pr-2 py-1 rounded cursor-pointer truncate h-8 hover:bg-gray-500 transition-all
      ${dropIndicator.className}
      ${memo.id.toString() === memoEditorSharedContext.id ? 'bg-gray-600' : 'hover:bg-gray-500'}
      ${(contextMenu != null) && contextMenu.memoId === memo.id.toString() ? 'bg-gray-600' : ''}
      `}
      style={dropIndicator.style}
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
}
