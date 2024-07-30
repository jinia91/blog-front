'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { type Folder, isFolderHasMemo } from '@/memo/application/domain/folder'
import { changeFolderName, deleteMemoById } from '@/memo/infra/api/memo'
import MemoAndFolderContextMenu, {
  type ContextMenuProps
} from '@/components/memo/memo-system-navigator/MemoAndFolderContextMenu'
import { rebuildMemoDeleted, rebuildNewNameFolder } from '@/components/memo/memo-system-navigator/folderSystemUtils'
import { FolderAndMemo } from '@/components/memo/memo-system-navigator/FolderAndMemoStructure'
import { type Tab } from '@/system/application/domain/tab'
import { useTabs } from '@/system/application/usecase/TabUseCases'
import { useFolderAndMemo } from '@/memo/application/usecase/memo-folder-usecases'
import { useMemoSystem } from '@/memo/application/usecase/memo-system-usecases'
import NavigatorHeader from '@/components/memo/memo-system-navigator/header/navigator-header'

export default function MemoSystemNavigator ({ className }: { className?: string }): React.ReactElement {
  const { folders, setFolders, deleteFolder, writeNewMemoTitle } = useFolderAndMemo()
  const { tabs, selectedTabIdx, updateNewTabsAndSelect } = useTabs()
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
      await deleteMemo()
    } else if ((memoContextMenu?.folderId) != null) {
      await deleteFolderAndUpdateTabs()
    }
  }

  async function deleteFolderAndUpdateTabs (): Promise<void> {
    if ((memoContextMenu?.folderId) == null) return
    // fixme 되는지 확인해볼것
    const newFolder = await deleteFolder(memoContextMenu.folderId)

    const asIsSelectedTab = tabs[selectedTabIdx]

    const newTabs = tabs.filter((tab: Tab) => {
      const memoId = tab.urlPath.startsWith('/memo/') ? tab.urlPath.split('/')[2] : null
      return memoId == null ||
        newFolder.some((folder: Folder) => isFolderHasMemo(folder, memoId))
    })
    const asIsTabIndex = newTabs.findIndex((tab: Tab) => tab.urlPath === asIsSelectedTab.urlPath)

    if (asIsTabIndex === -1) { // 기존 탭이 삭제되었을 경우
      const newSelectedTabIdx = newTabs.length > 0 ? newTabs.length - 1 : 0
      updateNewTabsAndSelect(newTabs, newSelectedTabIdx)
    } else { // 기존 탭이 존재하는 경우
      updateNewTabsAndSelect(newTabs, asIsTabIndex)
    }

    closeContextMenu()
  }

  // 폴더명 변경 todo 적절한 컴포넌트로 이동
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

  async function deleteMemo (): Promise<void> {
    if ((memoContextMenu?.memoId) == null) return
    await deleteMemoById(memoContextMenu.memoId)
    const newFolderStructure = rebuildMemoDeleted(folders, memoContextMenu.memoId)
    setFolders(newFolderStructure)
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
        updateNewTabsAndSelect(newTabs, newSelectedTabIdx)
      } else if (selectedTabIdx !== null && selectedTabIdx > deletedTabIndex) {
        updateNewTabsAndSelect(newTabs, selectedTabIdx - 1)
      }
    }
    closeContextMenu()
  }

  return (
    <div className={className}>
      <NavigatorHeader/>
      {MemoAndFolderContextMenu({ contextMenu: memoContextMenu, closeContextMenu, handleDeleteClick, handleRenameClick })}
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
