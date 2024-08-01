'use client'
import React, { useEffect, useRef, useState } from 'react'
import FolderItem from './folder-item'
import TabOpen from '../../../(layout)/(components)/(tap-system)/tab-open'
import MemoItem from './memo-item'
import { type ContextMenuProps } from './memo-folder-context-menu'
import { ApplicationType } from '../../../(layout)/(domain)/tab'
import { useMemoSystem } from '../../(usecase)/memo-system-usecases'
import { extractFolderIdByMemoId, type Folder } from '../../(domain)/folder'

export function FolderAndMemo ({
  folders,
  handleContextMenu,
  contextMenu,
  renamingFolderId,
  newFolderName,
  setNewFolderName,
  handleSubmitRename
}: {
  folders: Folder[]
  handleContextMenu: (e: React.MouseEvent<HTMLLIElement>, memoId?: string, folderId?: string, folderName?: string) => void
  contextMenu: ContextMenuProps | null
  renamingFolderId: string | null
  newFolderName: string
  setNewFolderName: (newFolderName: string) => void
  handleSubmitRename: () => void
}): React.ReactElement {
  const { memoEditorSharedContext } = useMemoSystem()
  const listRef = useRef<HTMLUListElement>(null)
  const getInitialOpenFolders = (): Set<any> => {
    const storedOpenFolders = localStorage.getItem('openFolders')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return (storedOpenFolders != null) ? new Set(JSON.parse(storedOpenFolders)) : new Set()
  }
  const [openFolders, setOpenFolders] = useState(getInitialOpenFolders)
  const scrollToViewIfNeeded = (): void => {
    if (listRef?.current != null) {
      const container = listRef.current
      const selectedMemoElement: HTMLElement | null = listRef.current.querySelector(`[data-memo-id="${memoEditorSharedContext.id}"]`)

      if (selectedMemoElement != null) {
        const containerScrollTop = container.scrollTop
        const containerHeight = container.offsetHeight
        const containerEnd = containerScrollTop + containerHeight

        const selectedItemOffset = selectedMemoElement.offsetTop - 240
        const selectedItemHeight = selectedMemoElement.offsetHeight
        const selectedItemEnd = selectedItemOffset + selectedItemHeight

        if (selectedItemOffset < containerScrollTop) {
          listRef.current.scrollTop = selectedItemOffset - 50
        } else if (selectedItemEnd + 80 > containerEnd) {
          listRef.current.scrollTop = selectedItemEnd - (containerHeight - selectedItemHeight) + 80
        }
      }
    }
  }

  useEffect(() => {
    const id = memoEditorSharedContext.id
    const folderId = parseInt(extractFolderIdByMemoId(folders, id) ?? '0')
    openFolders.has(folderId) || toggleFolder(folderId)
    scrollToViewIfNeeded()
  }, [memoEditorSharedContext])

  useEffect(() => {
    localStorage.setItem('openFolders', JSON.stringify(Array.from(openFolders)))
  }, [openFolders])

  const toggleFolder = (folderId: number): void => {
    setOpenFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
      }
      return newSet
    })
  }

  const renderItems = (folders: Folder[], depth: number): React.ReactNode => {
    return folders.map((folder) => {
      const isOpen = openFolders.has(folder.id ?? 0)
      return (
        <React.Fragment key={folder.id}>
          <FolderItem
            folder={folder}
            toggleFolder={toggleFolder}
            depth={depth}
            handleContextMenu={handleContextMenu}
            contextMenu={contextMenu}
            renamingFolderId={renamingFolderId}
            newFolderName={newFolderName}
            setNewFolderName={setNewFolderName}
            handleSubmitRename={handleSubmitRename}
            isOpen={isOpen}
          />
          {isOpen && (
            <>
              {folder.memos.map((memo) => (
                <TabOpen key={memo.id}
                         href={`/memo/${memo.id}`}
                         name={memo.title !== '' ? memo.title : `/memo/${memo.id}`}
                         type={ApplicationType.MEMO}
                >
                  <MemoItem
                    memo={memo}
                    parentFolderId={folder.id}
                    handleContextMenu={handleContextMenu}
                    contextMenu={contextMenu}
                    depth={depth}
                  />
                </TabOpen>
              ))}
              {folder.children.length > 0 && renderItems(folder.children, depth + 1)}
            </>
          )}
        </React.Fragment>
      )
    })
  }
  return (
    <ul ref={listRef}
        className="flex-grow overflow-auto text-white border-2 bg-gray-900 pt-1">
      {renderItems(folders, 0)}
    </ul>
  )
}
