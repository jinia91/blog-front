'use client'

import React, { type Dispatch, type SetStateAction, useContext } from 'react'
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
  const addTab = async (): Promise<void> => {
    const response = await createMemo('1')
    if (response == null) {
      console.log('createMemo error')
      return
    }
    const newHref = `/memo/${response.memoId}`
    const newTab = { name, context: newHref }
    const updatedTabs = [...tabs, newTab]
    setTabs(updatedTabs)
    setSelectedTabIdx(updatedTabs.length - 1)
    const newMemo: SimpleMemoInfo = { id: response.memoId, title: '', references: [] }
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

  return (
    <div className="tooltip">
      <div onClick={() => {
        addTab().catch(console.error)
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
