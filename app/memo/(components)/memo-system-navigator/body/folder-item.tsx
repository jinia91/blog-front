import { type Folder } from '../../../(domain)/folder'
import folderImg from '../../../../../public/emptyFolder.png'
import openFolder from '../../../../../public/openFolder.png'
import folderWithContentImg from '../../../../../public/contentFolder.png'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import { type ContextMenuProps } from './memo-folder-context-menu'
import { useFolderAndMemo } from '../../../(usecase)/memo-folder-usecases'

type DropPosition = 'before' | 'inside' | 'after' | null

export default function FolderItem ({
  folder,
  toggleFolder,
  depth,
  handleContextMenu,
  contextMenu,
  renamingFolderId,
  newFolderName,
  setNewFolderName,
  handleSubmitRename,
  isOpen,
  onCreateSubfolder,
  onCreateMemoInFolder,
  siblingFolders,
  parentFolderId
}: {
  folder: Folder
  toggleFolder: (folderId: number) => void
  depth: number
  handleContextMenu: (e: React.MouseEvent<HTMLLIElement>, memoId?: string, folderId?: string, folderName?: string) => void
  contextMenu: ContextMenuProps | null
  renamingFolderId: string | null
  newFolderName: string
  setNewFolderName: (newFolderName: string) => void
  handleSubmitRename: () => void
  isOpen: boolean
  onCreateSubfolder?: (folderId: number) => void
  onCreateMemoInFolder?: (folderId: number) => void
  siblingFolders?: Folder[]
  parentFolderId?: number | null
}): React.ReactElement {
  const { makeRelationshipAndRefresh, reorderFolderItem } = useFolderAndMemo()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dropPosition, setDropPosition] = useState<DropPosition>(null)
  const [isHovered, setIsHovered] = useState(false)

  const handleDragStart = (e: React.DragEvent, draggedItem: any): void => {
    e.dataTransfer.setData('application/reactflow', JSON.stringify(draggedItem))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleUnCategorizedContextMenu = (e: React.MouseEvent<HTMLLIElement>): void => {
    e.preventDefault()
  }

  const getDropPosition = (e: React.DragEvent): DropPosition => {
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const height = rect.height
    const threshold = height * 0.25

    if (y < threshold) return 'before'
    if (y > height - threshold) return 'after'
    return 'inside'
  }

  const handleDropCallback = (e: React.DragEvent, targetFolderId: number | null): void => {
    handleDrop(e, targetFolderId).catch(error => {
      console.debug(error)
    })
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
    if (draggedItem.type === 'folder' && draggedItem.id === folder.id) {
      return
    }

    // 폴더 중앙에 드롭 → 폴더 안으로 이동
    if (currentDropPosition === 'inside') {
      await makeRelationshipAndRefresh(draggedItem, targetFolderId)
      return
    }

    // 폴더 위/아래에 드롭
    if (currentDropPosition === 'before' || currentDropPosition === 'after') {
      if (draggedItem.type === 'folder' && siblingFolders !== undefined) {
        // 같은 레벨의 폴더인지 확인
        const isSameLevel = siblingFolders.some(f => f.id === draggedItem.id)

        if (isSameLevel) {
          // 같은 레벨 내 순서 변경
          // 드래그된 폴더를 제외한 리스트에서 prev/next 계산
          const foldersWithoutDragged = siblingFolders.filter(f => f.id !== draggedItem.id)
          const targetIndexInFiltered = foldersWithoutDragged.findIndex(f => f.id === folder.id)

          if (targetIndexInFiltered === -1) {
            // 타겟을 찾지 못한 경우 (비정상 상황)
            return
          }

          const prevFolder = currentDropPosition === 'before'
            ? foldersWithoutDragged[targetIndexInFiltered - 1]
            : foldersWithoutDragged[targetIndexInFiltered]
          const nextFolder = currentDropPosition === 'before'
            ? foldersWithoutDragged[targetIndexInFiltered]
            : foldersWithoutDragged[targetIndexInFiltered + 1]

          const prevSequence = prevFolder?.sequence ?? null
          const nextSequence = nextFolder?.sequence ?? null

          await reorderFolderItem(draggedItem.id, prevSequence, nextSequence)
        } else {
          // 다른 레벨의 폴더 → 부모 폴더로 이동
          await makeRelationshipAndRefresh(draggedItem, parentFolderId ?? null)
        }
      } else if (draggedItem.type === 'memo') {
        // 메모를 폴더 위/아래로 드래그 → 부모 폴더로 이동 (같은 레벨에 배치)
        await makeRelationshipAndRefresh(draggedItem, parentFolderId ?? null)
      }
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

  useEffect(() => {
    if (folder.id?.toString() === renamingFolderId) {
      inputRef.current?.focus()
    }
  }, [renamingFolderId, folder.id])

  const handleOutsideClick = (e: MouseEvent): void => {
    const target = e.target as Node
    if ((inputRef.current != null) && !inputRef.current.contains(target)) {
      setNewFolderName('')
      handleSubmitRename()
    }
  }
  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [])

  function hasChild (): boolean {
    return folder.children.length > 0 || folder.memos.length > 0
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
    if (dropPosition === 'inside') {
      return {
        className: 'border-2 border-blue-400',
        style: {
          background: 'rgba(96, 165, 250, 0.3)'
        }
      }
    }
    return { className: '' }
  }

  if (folder.id?.toString() === renamingFolderId) {
    return (
      <li
        className="pl-2 flex items-center pr-2 py-1 rounded cursor-pointer truncate h-8 bg-gray-600"
        style={{ marginLeft: `${depth * 20}px` }}
      >
        <div
          className={'flex items-center'}
          style={{ marginLeft: `${depth * 20}px` }}
        >
          <Image
            src={hasChild() ? isOpen ? openFolder : folderWithContentImg : folderImg}
            alt={'folder'}
            width={20}
            height={20}
          />
          <input
            ref={inputRef}
            type="text"
            value={newFolderName}
            onChange={(e) => {
              setNewFolderName(e.target.value)
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSubmitRename()
              }
            }}
            className="flex-grow ml-2 bg-gray-700 text-white rounded p-1 border-none focus:outline-none focus:ring-0"
          />
        </div>
      </li>
    )
  } else {
    const isOnContextMenu = ((contextMenu?.folderId) != null) && contextMenu.folderId === folder.id?.toString()
    const dropIndicator = getDropIndicatorStyle()
    return (
      <li
        draggable={true}
        onDragStart={(e) => {
          handleDragStart(e, { id: folder.id, type: 'folder' })
        }}
        onDrop={(e) => {
          handleDropCallback(e, folder.id)
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onMouseEnter={() => { setIsHovered(true) }}
        onMouseLeave={() => { setIsHovered(false) }}
        className={`pl-2 flex items-center pr-2 py-1 rounded cursor-pointer truncate h-8 hover:bg-gray-500 transition-all
        ${dropIndicator.className}
      ${isOnContextMenu ? 'bg-gray-600' : ''}`}
        style={dropIndicator.style}
        onContextMenu={(e) => {
          folder.id === null
            ? handleUnCategorizedContextMenu(e)
            : handleContextMenu(e, undefined, folder.id.toString(), folder.name)
        }}
        onClick={() => {
          if (hasChild()) {
            toggleFolder(folder.id ?? 0)
          }
        }}
      >
        <div
          className={'flex items-center flex-grow'}
          style={{ marginLeft: `${depth * 20}px` }}
        >
          <Image
            src={hasChild() ? isOpen ? openFolder : folderWithContentImg : folderImg}
            alt={'folder'}
            width={20}
            height={20}
          />
          <span className="ml-2">{folder.name}</span>
        </div>
        {isHovered && folder.id !== null && (
          <div className="ml-auto flex items-center gap-1">
            <button
              className="p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-white text-xs"
              onClick={(e) => {
                e.stopPropagation()
                if (folder.id !== null) {
                  onCreateMemoInFolder?.(folder.id)
                }
              }}
              title="메모 추가"
            >
              +M
            </button>
            <button
              className="p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-white text-xs"
              onClick={(e) => {
                e.stopPropagation()
                if (folder.id !== null) {
                  onCreateSubfolder?.(folder.id)
                }
              }}
              title="하위 폴더 추가"
            >
              +F
            </button>
          </div>
        )}
      </li>
    )
  }
}
