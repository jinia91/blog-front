'use client'

import React, { useEffect } from 'react'
import { createMemo } from '@/memo/infra/api/memo'
import { type FolderInfo, type SimpleMemoInfo } from '@/memo/application/domain/models'
import Image from 'next/image'
import newMemo from '../../../../../public/newMemo.png'
import { useTabs } from '@/system/application/usecase/TabUseCases'
import { useFolder } from '@/memo/application/usecase/folder-usecases'

export default function NewMemoButton (): React.ReactElement {
  const { tabs, setTabs, selectTab } = useTabs()
  const { folders: foldersRef, setFolders: setFoldersRef } = useFolder()
  const createNewMemo = async (): Promise<void> => {
    const memo = await createMemo()
    if (memo == null) {
      return
    }
    const name = '새 메모'
    const newHref = `/memo/${memo.memoId}`
    const newTab = { name, urlPath: newHref }
    const updatedTabs = [...tabs, newTab]
    setTabs(updatedTabs)
    selectTab(updatedTabs.length - 1)
    const newMemo: SimpleMemoInfo = { id: memo.memoId, title: '', references: [] }
    const unCategoryFolder = foldersRef.find((folder) => folder.id === null)
    const newUnCategoryFolder: FolderInfo = (unCategoryFolder != null)
      ? {
          ...unCategoryFolder,
          memos: [...unCategoryFolder.memos, newMemo]
        }
      : { id: null, name: 'unCategory', parent: null, memos: [newMemo], children: [] }
    const newFolders = [...foldersRef.filter((folder) => folder.id !== null), newUnCategoryFolder]
    setFoldersRef(newFolders)
  }

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent): Promise<void> => {
      if ((event.ctrlKey && event.key === 'n') || (event.ctrlKey && event.key === 'ㅜ')) {
        event.preventDefault()
        await createNewMemo().catch(console.error)
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [createNewMemo])

  return (
    <div className="tooltip">
      <div onClick={() => {
        createNewMemo().catch(console.error)
      }}>
        <button
          className="text-white hover:text-gray-300"
          aria-label='newMemo'
          type='button'
        >
          <Image src={newMemo} alt={'newMemo'}
                 className={'white-image'}
                 width={30} height={30}/>
        </button>
        <span className="tooltip-message">새 메모</span>
      </div>
    </div>
  )
}