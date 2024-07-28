'use client'

import React, { type Dispatch, type SetStateAction, useContext, useEffect } from 'react'
import { type FolderInfo } from '@/outbound/api/models'
import Image from 'next/image'
import ref from '../../../../../public/ref.png'
import { fetchReferencedByMemoId, fetchReferencesByMemoId } from '@/outbound/api/memo'
import { MemoEditContext } from '@/components/memo/MemoEditContextProvider'

export default function ReferenceSystem ({ foldersRef, setFoldersRef, isReferenceMode, setReferenceMode, refreshCount }: {
  foldersRef: FolderInfo[]
  setFoldersRef: Dispatch<SetStateAction<FolderInfo[]>>
  isReferenceMode: boolean
  setReferenceMode: Dispatch<SetStateAction<boolean>>
  refreshCount: number
}): React.ReactElement {
  const { underwritingId }: { underwritingId: string } = useContext(MemoEditContext)

  useEffect(() => {
    if (underwritingId == null) {
      return
    }
    const fetchData = async (): Promise<void> => {
      try {
        const references = await fetchReferencesByMemoId(underwritingId.toString()) ?? []
        const referenced = await fetchReferencedByMemoId(underwritingId.toString()) ?? []
        const referenceFolderInfo = {
          id: 1,
          name: '참조중',
          parent: null,
          memos: references,
          children: []
        }
        const referencedFolderInfo = {
          id: 2,
          name: '참조됨',
          parent: null,
          memos: referenced,
          children: []
        }
        const newFolders = [referenceFolderInfo, referencedFolderInfo]
        setFoldersRef(newFolders)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    if (isReferenceMode) {
      void fetchData()
    }
  }, [underwritingId, isReferenceMode, refreshCount])

  return (
    <div className="tooltip">
      <div onClick={() => {
        setReferenceMode(!isReferenceMode)
      }}>
        <button
          className="text-white hover:text-gray-300 ml-2"
          aria-label='reference-system'
          type='button'
        >
          <Image src={ref} alt={'reference-system'}
                 className={'white-image'}
                 width={30} height={30}/>
        </button>
        {!isReferenceMode
          ? <span className="tooltip-message">참조모드</span>
          : <span className="tooltip-message">전체모드</span>}
      </div>
    </div>
  )
}
