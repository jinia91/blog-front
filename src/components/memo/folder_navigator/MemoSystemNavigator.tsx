'use client'
import React, { type Dispatch, type SetStateAction, useCallback, useContext, useEffect, useState } from 'react'
import { type FolderInfo } from '@/api/models'
import { changeFolderName, deleteFolderById, deleteMemoById, fetchFolderAndMemo } from '@/api/memo'
import { TabBarContext } from '@/components/DynamicLayout'
import MemoAndFolderContextMenu, {
  type ContextMenuProps
} from '@/components/memo/folder_navigator/MemoAndFolderContextMenu'
import {
  folderContainsMemo,
  rebuildMemoDeleted,
  rebuildMemoTitle,
  rebuildNewNameFolder
} from '@/components/memo/folder_navigator/FolderSystemUtils'
import { FolderAndMemo } from '@/components/memo/folder_navigator/FolderAndMemoStructure'
import { FolderContext, MemoEditContext } from '@/components/memo/MemoFolderContainer'
import NavigatorHeader from '@/components/memo/folder_navigator/header/NavigatorHeader'
import { type Tab } from '@/components/tapbar/TabItem'

export default function MemoSystemNavigator ({ className }: { className?: string }): React.ReactElement {
  const { folders, setFolders }: {
    folders: FolderInfo[]
    setFolders: Dispatch<SetStateAction<FolderInfo[]>>
  } = useContext(FolderContext)
  const { tabs, selectedTabIdx, setTabs, setSelectedTabIdx }: {
    tabs: Tab[]
    selectedTabIdx: number | null
    setTabs: Dispatch<SetStateAction<Tab[]>>
    setSelectedTabIdx: Dispatch<SetStateAction<number | null>>
  } = useContext(TabBarContext)
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
      await deleteFolder()
    }
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

  async function deleteFolder (): Promise<void> {
    if ((memoContextMenu?.folderId) == null) return

    const result = await deleteFolderById(memoContextMenu.folderId)
    if (result != null) {
      const newFetchedFolders = await fetchFolderAndMemo()
      if (newFetchedFolders == null) return
      setFolders(newFetchedFolders)

      const newTabs = tabs.filter((tab: Tab) => {
        const memoId = tab.context.startsWith('/memo/') ? tab.context.split('/')[2] : null

        return memoId == null ||
          newFetchedFolders.some((folder: FolderInfo) => folderContainsMemo(folder, memoId))
      })
      setTabs(newTabs)

      if (selectedTabIdx !== null && newTabs[selectedTabIdx] !== null) {
        const newSelectedTabIdx = newTabs.length > 0 ? newTabs.length - 1 : null
        setSelectedTabIdx(newSelectedTabIdx)
      }
      closeContextMenu()
    }
  }

  async function deleteMemo (): Promise<void> {
    if ((memoContextMenu?.memoId) == null) return
    const result = await deleteMemoById(memoContextMenu.memoId)
    if (result != null) {
      const newFolderStructure = rebuildMemoDeleted(folders, memoContextMenu.memoId)
      setFolders(newFolderStructure)
      // eslint-disable-next-line array-callback-return
      const deletedTabIndex = tabs.findIndex(function (tab: Tab) {
        if (tab.context.startsWith('/memo/')) {
          const memoId = tab.context.split('/')[2]
          return memoId === memoContextMenu.memoId
        }
      })
      if (deletedTabIndex !== -1) {
        const newTabs = tabs.filter(function (_: any, idx: number) {
          return idx !== deletedTabIndex
        })
        setTabs(newTabs)

        if (selectedTabIdx === deletedTabIndex) {
          const newSelectedTabIdx = newTabs.length > 0 ? newTabs.length - 1 : null
          setSelectedTabIdx(newSelectedTabIdx)
        } else if (selectedTabIdx !== null && selectedTabIdx > deletedTabIndex) {
          setSelectedTabIdx(selectedTabIdx - 1)
        }
      }
      closeContextMenu()
    }
  }

  return (
    <div className={className}>
      <NavigatorHeader folders={folders} setFolders={setFolders}/>
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
