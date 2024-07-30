'use client'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { type FolderInfo } from '@/memo/application/domain/models'
import { changeFolderName, deleteMemoById } from '@/memo/infra/api/memo'
import MemoAndFolderContextMenu, {
  type ContextMenuProps
} from '@/components/memo/memo-system-navigator/MemoAndFolderContextMenu'
import {
  folderContainsMemo,
  rebuildMemoDeleted,
  rebuildMemoTitle,
  rebuildNewNameFolder
} from '@/components/memo/memo-system-navigator/folderSystemUtils'
import { FolderAndMemo } from '@/components/memo/memo-system-navigator/FolderAndMemoStructure'
import NavigatorHeader from '@/components/memo/memo-system-navigator/header/NavigatorHeader'
import { MemoEditContext } from '@/components/memo/MemoEditContextProvider'
import { type Tab } from '@/system/application/domain/Tab'
import { useTabs } from '@/system/application/usecase/TabUseCases'
import { useFolder } from '@/memo/application/usecase/folder-usecases'

export default function MemoSystemNavigator ({ className }: { className?: string }): React.ReactElement {
  const { folders, setFolders, deleteFolder } = useFolder()
  const { tabs, selectedTabIdx, setTabs, selectTab } = useTabs()
  const { underwritingTitle, underwritingId }: {
    underwritingTitle: string
    underwritingId: string
  } = useContext(MemoEditContext)

  useEffect(() => {
    const newFolderRef = rebuildMemoTitle(folders, underwritingId, underwritingTitle ?? '')
    setFolders(newFolderRef)
  }, [underwritingTitle])

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

    const newTabs = tabs.filter((tab: Tab) => {
      const memoId = tab.urlPath.startsWith('/memo/') ? tab.urlPath.split('/')[2] : null
      return memoId == null ||
        newFolder.some((folder: FolderInfo) => folderContainsMemo(folder, memoId))
    })
    setTabs(newTabs)

    if (selectedTabIdx !== null && newTabs[selectedTabIdx] !== null) {
      const newSelectedTabIdx = newTabs.length > 0 ? newTabs.length - 1 : 0
      selectTab(newSelectedTabIdx)
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
      setTabs(newTabs)

      if (selectedTabIdx === deletedTabIndex) {
        const newSelectedTabIdx = newTabs.length > 0 ? newTabs.length - 1 : 0
        selectTab(newSelectedTabIdx)
      } else if (selectedTabIdx !== null && selectedTabIdx > deletedTabIndex) {
        selectTab(selectedTabIdx - 1)
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
