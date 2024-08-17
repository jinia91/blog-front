'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { folderManager } from '../../(domain)/folder'
import { changeFolderName } from '../../(infra)/memo'
import MemoFolderContextMenu, { type ContextMenuProps } from './body/memo-folder-context-menu'
import { FolderAndMemo } from './body/folder-memo-structure'
import { useFolderAndMemo } from '../../(usecase)/memo-folder-usecases'
import { useMemoSystem } from '../../(usecase)/memo-system-usecases'
import NavigatorHeader from './header/navigator-header'
import { useMemoFolderWithTabRouter } from '../../(usecase)/memo-folder-tab-usecases'

export default function MemoSystemNavigatorMain ({ className }: { className?: string }): React.ReactElement {
  const { folders, setFolders, writeNewMemoTitle } = useFolderAndMemo()
  const { deleteFolderAndUpdateTabs, deleteMemoAndUpdateTabs } = useMemoFolderWithTabRouter()
  const [memoContextMenu, setMemoContextMenu] = useState<ContextMenuProps | null>(null)
  const { memoEditorSharedContext } = useMemoSystem()
  console.log('MemoSystemNavigatorMain')

  useEffect(() => {
    writeNewMemoTitle(memoEditorSharedContext.id, memoEditorSharedContext.title)
  }, [memoEditorSharedContext])

  const closeContextMenu = useCallback(() => {
    setMemoContextMenu(null)
  }, [])

  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLLIElement>, memoId?: string, folderId?: string, folderName?: string) => {
    event.preventDefault()
    setMemoContextMenu({
      xPos: `${event.pageX}px`,
      yPos: `${event.pageY}px`,
      memoId,
      folderId,
      folderName
    })
  }, [])

  useEffect(() => {
    document.addEventListener('click', closeContextMenu)
    return () => {
      document.removeEventListener('click', closeContextMenu)
    }
  }, [closeContextMenu])

  const handleDeleteClick = async (): Promise<void> => {
    if ((memoContextMenu?.memoId) != null) {
      await deleteMemoAndUpdateTabs(memoContextMenu.memoId)
    } else if ((memoContextMenu?.folderId) != null) {
      await deleteFolderAndUpdateTabs(memoContextMenu.folderId)
    }
    closeContextMenu()
  }

  const [renamingFolderId, setRenamingFolderId] = useState<string>('')
  const [newFolderName, setNewFolderName] = useState<string>('')

  const handleRenameClick = (folderId: string, currentName: string): void => {
    setRenamingFolderId(folderId)
    setNewFolderName(currentName)
  }

  const handleSubmitRename = async (): Promise<void> => {
    if (newFolderName === '') {
      setRenamingFolderId('')
    } else if (renamingFolderId !== '') {
      const result = await changeFolderName(renamingFolderId, newFolderName)
      if (result != null) {
        const newFolderRef = folderManager.rebuildFoldersAtUpdatingFolderTitle(folders, renamingFolderId, newFolderName)
        setRenamingFolderId('')
        setFolders(newFolderRef)
      }
    }
  }

  return (
    <div className={className}>
      <NavigatorHeader/>
      {MemoFolderContextMenu({ contextMenu: memoContextMenu, closeContextMenu, handleDeleteClick, handleRenameClick })}
      <FolderAndMemo
        folders={folders}
        handleContextMenu={handleContextMenu}
        contextMenu={memoContextMenu}
        renamingFolderId={renamingFolderId}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        handleSubmitRename={() => {
          handleSubmitRename().catch(console.error)
        }}
      />
    </div>
  )
}
