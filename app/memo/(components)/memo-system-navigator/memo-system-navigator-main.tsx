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
import { useOpenFolders } from '../../(usecase)/memo-navigator-usecases'
import { useTabBarAndRouter } from '../../../(layout)/(usecase)/tab-usecases'

export default function MemoSystemNavigatorMain ({ className, onToggleNavigator, onToggleBacklinks, backlinksVisible }: {
  className?: string
  onToggleNavigator?: () => void
  onToggleBacklinks?: () => void
  backlinksVisible?: boolean
}): React.ReactElement {
  const { folders, setFolders, writeNewMemoTitle, createNewFolder, createNewMemo } = useFolderAndMemo()
  const { deleteFolderAndUpdateTabs, deleteMemoAndUpdateTabs } = useMemoFolderWithTabRouter()
  const [memoContextMenu, setMemoContextMenu] = useState<ContextMenuProps | null>(null)
  const { memoEditorSharedContext } = useMemoSystem()
  const { collapseAll, openFolder } = useOpenFolders()
  const { upsertAndSelectTab } = useTabBarAndRouter()

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

<<<<<<< Updated upstream
=======
<<<<<<< Updated upstream
=======
>>>>>>> Stashed changes
  const handleCreateSubfolder = async (): Promise<void> => {
    if (memoContextMenu?.folderId != null) {
      const folderId = Number(memoContextMenu.folderId)
      await createNewFolder(folderId)
      openFolder(folderId)
      closeContextMenu()
    }
  }

  const handleCreateSubfolderFromHover = async (folderId: number): Promise<void> => {
    await createNewFolder(folderId)
    openFolder(folderId)
  }

  const handleCreateMemoInFolder = async (): Promise<void> => {
    if (memoContextMenu?.folderId != null) {
      const folderId = Number(memoContextMenu.folderId)
      const memoId = await createNewMemo(folderId)
      openFolder(folderId)
<<<<<<< Updated upstream
      upsertAndSelectTab({ name: '', urlPath: `/memo/${memoId}` })
=======
      upsertAndSelectTab({ name: '새 메모', urlPath: `/memo/${memoId}` })
>>>>>>> Stashed changes
      closeContextMenu()
    }
  }

  const handleCreateMemoInFolderFromHover = async (folderId: number): Promise<void> => {
    const memoId = await createNewMemo(folderId)
    openFolder(folderId)
<<<<<<< Updated upstream
    upsertAndSelectTab({ name: '', urlPath: `/memo/${memoId}` })
  }

=======
    upsertAndSelectTab({ name: '새 메모', urlPath: `/memo/${memoId}` })
  }

>>>>>>> Stashed changes
>>>>>>> Stashed changes
  return (
    <div className={className}>
      <NavigatorHeader
        onCollapseAll={collapseAll}
        onToggleNavigator={onToggleNavigator}
        onToggleBacklinks={onToggleBacklinks}
        backlinksVisible={backlinksVisible}
      />
      {MemoFolderContextMenu({
        contextMenu: memoContextMenu,
        closeContextMenu,
        handleDeleteClick,
        handleRenameClick,
        handleCreateSubfolder: () => {
          handleCreateSubfolder().catch(console.debug)
        },
        handleCreateMemoInFolder: () => {
          handleCreateMemoInFolder().catch(console.debug)
        }
      })}
      <FolderAndMemo
        folders={folders}
        handleContextMenu={handleContextMenu}
        contextMenu={memoContextMenu}
        renamingFolderId={renamingFolderId}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        handleSubmitRename={() => {
          handleSubmitRename().catch(console.debug)
        }}
        onCreateSubfolder={(folderId) => {
          handleCreateSubfolderFromHover(folderId).catch(console.debug)
        }}
        onCreateMemoInFolder={(folderId) => {
          handleCreateMemoInFolderFromHover(folderId).catch(console.debug)
        }}
      />
    </div>
  )
}
