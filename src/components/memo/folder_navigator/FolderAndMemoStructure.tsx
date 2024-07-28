'use client'
import { type FolderInfo } from '@/outbound/api/models'
import React, { useContext, useEffect, useRef, useState } from 'react'
import FolderItem from '@/components/memo/folder_navigator/FolderItem'
import TabLink from '@/components/ui-layout/tap_system/TabLink'
import MemoItem from '@/components/memo/folder_navigator/MemoItem'
import { type ContextMenuProps } from '@/components/memo/folder_navigator/MemoAndFolderContextMenu'
import { MemoEditContext } from '@/components/memo/MemoEditContextProvider'

export function FolderAndMemo ({
  folders,
  handleContextMenu,
  contextMenu,
  renamingFolderId,
  newFolderName,
  setNewFolderName,
  handleSubmitRename
}: {
  folders: FolderInfo[]
  handleContextMenu: (e: React.MouseEvent<HTMLLIElement>, memoId?: string, folderId?: string, folderName?: string) => void
  contextMenu: ContextMenuProps | null
  renamingFolderId: string | null
  newFolderName: string
  setNewFolderName: (newFolderName: string) => void
  handleSubmitRename: () => void
}): React.ReactElement {
  const { underwritingTitle, underwritingId } = useContext(MemoEditContext)
  const listRef = useRef<HTMLUListElement>(null)
  const getInitialOpenFolders = (): Set<any> => {
    const storedOpenFolders = localStorage.getItem('openFolders')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return (storedOpenFolders != null) ? new Set(JSON.parse(storedOpenFolders)) : new Set()
  }
  const [openFolders, setOpenFolders] = useState(getInitialOpenFolders)
  const scrollToCenter = (): void => {
    if (listRef?.current != null) {
      const selectedMemoElement: HTMLElement | null = listRef.current.querySelector(`[data-memo-id="${underwritingId}"]`)
      if (selectedMemoElement != null) {
        const listHeight = listRef.current.offsetHeight
        const memoPosition = selectedMemoElement.offsetTop
        const memoHeight = selectedMemoElement.offsetHeight
        const centerPosition = memoPosition - (listHeight / 2) + (memoHeight / 2)
        listRef.current.scrollTop = centerPosition
      } else {
        listRef.current.scrollTop = listRef.current.offsetHeight
      }
    }
  }
  useEffect(() => {
    scrollToCenter()
  }, [folders, underwritingId, underwritingTitle])
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
  const renderItems = (folders: FolderInfo[], depth: number): React.ReactNode => {
    return folders.map((folder) => (
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
        />
        {openFolders.has(folder.id ?? 0) && (
          <>
            {folder.memos.map((memo) => (
              <TabLink key={memo.id} href={`/memo/${memo.id}`}
                       name={memo.title !== '' ? memo.title : `/memo/${memo.id}`}>
                <MemoItem
                  memo={memo}
                  parentFolderId={folder.id}
                  handleContextMenu={handleContextMenu}
                  contextMenu={contextMenu}
                  depth={depth}
                />
              </TabLink>
            ))}
            {folder.children.length > 0 && renderItems(folder.children, depth + 1)}
          </>
        )}
      </React.Fragment>
    ))
  }
  return (
    <ul ref={listRef}
        className="flex-grow overflow-auto text-white border-2 bg-gray-900 pt-1">
      {renderItems(folders, 0)}
    </ul>
  )
}
