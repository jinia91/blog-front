'use client'

import React, { type Dispatch, type SetStateAction, useContext, useEffect } from 'react'
import { TabBarContext } from '@/components/DynamicLayout'
import { createMemo } from '@/api/memo'
import { type FolderInfo, type SimpleMemoInfo } from '@/api/models'
import Image from 'next/image'
import newMemo from '../../../../../public/newMemo.png'

export default function NewMemoLink ({ name, foldersRef, setFoldersRef }: {
  name: string
  foldersRef: FolderInfo[]
  setFoldersRef: Dispatch<SetStateAction<FolderInfo[]>>
}): React.ReactElement {
  const { tabs, setTabs, setSelectedTabIdx } = useContext(TabBarContext)
  // const { session }: { session: Session } = useContext(AuthSessionContext)
  const createNewMemo = async (): Promise<void> => {
    const memo = await createMemo()
    if (memo == null) {
      console.log('createMemo error')
      return
    }
    const newHref = `/memo/${memo.memoId}`
    const newTab = { name, context: newHref }
    const updatedTabs = [...tabs, newTab]
    setTabs(updatedTabs)
    setSelectedTabIdx(updatedTabs.length - 1)
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
