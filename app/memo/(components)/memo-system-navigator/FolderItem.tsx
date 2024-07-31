import { type Folder } from '../../(domain)/folder'
import folderImg from '../../../../public/emptyFolder.png'
import openFolder from '../../../../public/openFolder.png'
import folderWithContentImg from '../../../../public/contentFolder.png'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import { type ContextMenuProps } from './memo-folder-context-menu'
import { useFolderAndMemo } from '../../(usecase)/memo-folder-usecases'

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
  isOpen
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
}): React.ReactElement {
  const { makeRelationshipAndRefresh } = useFolderAndMemo()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragStart = (e: React.DragEvent, draggedItem: any): void => {
    e.dataTransfer.setData('application/reactflow', JSON.stringify(draggedItem))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleUnCategorizedContextMenu = (e: React.MouseEvent<HTMLLIElement>): void => {
    e.preventDefault()
  }
  const handleDropCallback = (e: React.DragEvent, targetFolderId: number | null): void => {
    handleDrop(e, targetFolderId).catch(error => {
      console.error(error)
    })
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
        className={`pl-2 flex items-center pr-2 py-1 rounded cursor-pointer truncate h-8 hover:bg-gray-500
        ${isDragOver ? 'bg-gray-500' : ''}
      ${isOnContextMenu ? 'bg-gray-600' : ''}`}
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
          className={'flex items-center'}
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
      </li>
    )
  }
};
