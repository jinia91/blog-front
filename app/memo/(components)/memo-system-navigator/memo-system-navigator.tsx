'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { type Folder, folderManager, rebuildNewNameFolder } from '../../(domain)/folder'
import { changeFolderName } from '../../(infra)/memo'
import MemoFolderContextMenu, { type ContextMenuProps } from './memo-folder-context-menu'
import { FolderAndMemo } from './folder-memo-structure'
import { type Tab } from '../../../(layout)/(domain)/tab'
import { useTabBarAndRouter } from '../../../(layout)/(usecase)/tab-usecases'
import { useFolderAndMemo } from '../../(usecase)/memo-folder-usecases'
import { useMemoSystem } from '../../(usecase)/memo-system-usecases'
import NavigatorHeader from './header/navigator-header'

export default function MemoSystemNavigator ({ className }: { className?: string }): React.ReactElement {
  const { folders, setFolders, deleteFolder, writeNewMemoTitle, deleteMemo } = useFolderAndMemo()
  const { tabs, selectedTabIdx, updateTabBar } = useTabBarAndRouter()
  const { memoEditorSharedContext } = useMemoSystem()

  useEffect(() => {
    writeNewMemoTitle(memoEditorSharedContext.id, memoEditorSharedContext.title)
  }, [memoEditorSharedContext])

  const [memoContextMenu, setMemoContextMenu] = useState<ContextMenuProps | null>(null)
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
      await deleteMemoAndUpdateTabs()
    } else if ((memoContextMenu?.folderId) != null) {
      await deleteFolderAndUpdateTabs()
    }
  }

  async function deleteFolderAndUpdateTabs (): Promise<void> {
    if ((memoContextMenu?.folderId) == null) return
    const newFolder = await deleteFolder(memoContextMenu.folderId)

    const asIsSelectedTab = tabs[selectedTabIdx]

    const newTabs = tabs.filter((tab: Tab) => {
      const memoId = tab.urlPath.startsWith('/memo/') ? tab.urlPath.split('/')[2] : null
      return memoId == null ||
        newFolder.some((folder: Folder) => folderManager.isFolderHasMemo(folder, memoId))
    })
    const asIsSelectedIndexBasedNewTabs = newTabs.findIndex((tab: Tab) => tab.urlPath === asIsSelectedTab.urlPath)

    if (asIsSelectedIndexBasedNewTabs === -1) { // 기존 탭이 삭제되었을 경우
      const newSelectedTabIdx = newTabs.length > 0 ? newTabs.length - 1 : 0
      updateTabBar(newTabs, newSelectedTabIdx)
    } else { // 기존 탭이 존재하는 경우
      updateTabBar(newTabs, asIsSelectedIndexBasedNewTabs)
    }
    closeContextMenu()
  }

  async function deleteMemoAndUpdateTabs (): Promise<void> {
    if ((memoContextMenu?.memoId) == null) return
    await deleteMemo(memoContextMenu.memoId)
    // eslint-disable-next-line array-callback-return
    const deletedTabIndex = tabs.findIndex(function (tab: Tab) {
      if (tab.urlPath.startsWith('/memo/')) {
        const memoId = tab.urlPath.split('/')[2]
        return memoId === memoContextMenu.memoId
      }
    })
    if (deletedTabIndex !== -1) {
      const newTabs = tabs.filter(function (_: any, idx: number) {
        return idx !== deletedTabIndex
      })

      if (selectedTabIdx === deletedTabIndex) {
        const newSelectedTabIdx = newTabs.length > 0 ? newTabs.length - 1 : 0
        updateTabBar(newTabs, newSelectedTabIdx)
      } else if (selectedTabIdx !== null && selectedTabIdx > deletedTabIndex) {
        updateTabBar(newTabs, selectedTabIdx - 1)
      }
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
        const newFolderRef = rebuildNewNameFolder(folders, renamingFolderId, newFolderName)
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
