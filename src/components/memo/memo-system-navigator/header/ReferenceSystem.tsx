'use client'

import React, { useEffect } from 'react'
import Image from 'next/image'
import ref from '../../../../../public/ref.png'
import { useFolderAndMemo } from '@/memo/application/usecase/memo-folder-usecases'
import { useMemoSystem } from '@/memo/application/usecase/memo-system-usecases'

export default function ReferenceSystem (): React.ReactElement {
  const { fetchReferenceMemos } = useFolderAndMemo()
  const { navigatorContext, memoEditorSharedContext, toggleReferenceMode, refreshListener } = useMemoSystem()
  useEffect(() => {
    if (navigatorContext.isReferenceMode) {
      void fetchReferenceMemos(memoEditorSharedContext.id)
    }
  }, [navigatorContext, memoEditorSharedContext, refreshListener])

  return (
    <div className="tooltip">
      <div onClick={() => {
        toggleReferenceMode()
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
        {!navigatorContext.isReferenceMode
          ? <span className="tooltip-message">참조모드</span>
          : <span className="tooltip-message">전체모드</span>}
      </div>
    </div>
  )
}
