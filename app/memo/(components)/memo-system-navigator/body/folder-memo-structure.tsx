'use client'
import React, { useEffect, useRef } from 'react'
import FolderItem from './folder-item'
import TabOpen from '../../../../(layout)/(components)/(tap-system)/tab-open'
import MemoItem from './memo-item'
import { type ContextMenuProps } from './memo-folder-context-menu'
import { ApplicationType } from '../../../../(layout)/(domain)/tab'
import { useMemoSystem } from '../../../(usecase)/memo-system-usecases'
import { type Folder, folderFinder } from '../../../(domain)/folder'
import { useOpenFolders } from '../../../(usecase)/memo-navigator-usecases'
import { compareBySequenceAndId } from '../../../(domain)/lexorank'

export function FolderAndMemo ({
  folders,
  handleContextMenu,
  contextMenu,
  renamingFolderId,
  newFolderName,
  setNewFolderName,
  handleSubmitRename,
  onCreateSubfolder,
  onCreateMemoInFolder
}: {
  folders: Folder[]
  handleContextMenu: (e: React.MouseEvent<HTMLLIElement>, memoId?: string, folderId?: string, folderName?: string) => void
  contextMenu: ContextMenuProps | null
  renamingFolderId: string | null
  newFolderName: string
  setNewFolderName: (newFolderName: string) => void
  handleSubmitRename: () => void
  onCreateSubfolder?: (folderId: number) => void
  onCreateMemoInFolder?: (folderId: number) => void
}): React.ReactElement {
  const { memoEditorSharedContext } = useMemoSystem()
  const listRef = useRef<HTMLUListElement>(null)
  const { openFolders, toggleFolder, openFolder, initializeFromStorage } = useOpenFolders()

  useEffect(() => {
    initializeFromStorage()
  }, [])
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
    const folderIds = folderFinder.findFolderIdsPathToMemoId(folders, id)
    folderIds.forEach(folderId => {
      openFolder(parseInt(folderId))
    })
    scrollToViewIfNeeded()
  }, [memoEditorSharedContext])

  const sortBySequence = <T extends { sequence?: string, id: number | null }>(items: T[]): T[] => {
    return [...items].sort(compareBySequenceAndId)
  }

  const renderItems = (folders: Folder[], depth: number, parentFolderId: number | null = null): React.ReactNode => {
    const sortedFolders = sortBySequence(folders)
    return sortedFolders.map((folder) => {
      const isOpen = openFolders.has(folder.id ?? 0)
      const sortedMemos = sortBySequence(folder.memos)
      const sortedChildren = sortBySequence(folder.children)
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
            onCreateSubfolder={onCreateSubfolder}
            onCreateMemoInFolder={onCreateMemoInFolder}
            siblingFolders={sortedFolders}
            parentFolderId={parentFolderId}
          />
          {isOpen && (
            <>
              {sortedMemos.map((memo, index) => (
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
                    siblingMemos={sortedMemos}
                    memoIndex={index}
                  />
                </TabOpen>
              ))}
              {sortedChildren.length > 0 && renderItems(sortedChildren, depth + 1, folder.id)}
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
