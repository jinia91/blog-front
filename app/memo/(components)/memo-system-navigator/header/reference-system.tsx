'use client'

import React, { useEffect } from 'react'
import Image from 'next/image'
import ref from '../../../../../public/ref.png'
import { useFolderAndMemo } from '../../../(usecase)/memo-folder-usecases'
import { useMemoSystem } from '../../../(usecase)/memo-system-usecases'
import { NavigatorContextType } from '../../../(domain)/memo-system-navigator-context'

export default function ReferenceSystem (): React.ReactElement {
  const { searchReferenceMemos, refreshFolders } = useFolderAndMemo()
  const { navigatorContext, memoEditorSharedContext, toggleReferenceMode } = useMemoSystem()

  useEffect(() => {
    if (navigatorContext.type === NavigatorContextType.REFERENCE_MODE) {
      void searchReferenceMemos(memoEditorSharedContext.id)
    }
  }, [navigatorContext, memoEditorSharedContext])

  const handleToggle = (): void => {
    // 참조모드에서 전체모드로 돌아갈 때 폴더 새로고침
    if (navigatorContext.type === NavigatorContextType.REFERENCE_MODE) {
      toggleReferenceMode()
      void refreshFolders()
    } else {
      toggleReferenceMode()
    }
  }

  return (
    <div className="tooltip">
      <div onClick={handleToggle}>
        <button
          className="text-white hover:text-gray-300 ml-2"
          aria-label='reference-system'
          type='button'
        >
          <Image src={ref} alt={'reference-system'}
                 className={'white-image'}
                 width={30} height={30}/>
        </button>
        {navigatorContext.type !== NavigatorContextType.REFERENCE_MODE
          ? <span className="tooltip-message">참조모드</span>
          : <span className="tooltip-message">전체모드</span>}
      </div>
    </div>
  )
}
