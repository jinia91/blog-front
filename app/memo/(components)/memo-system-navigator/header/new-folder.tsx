'use client'

import React from 'react'
import Image from 'next/image'
import newFolder from '../../../../../public/newFolder.png'
import { useFolderAndMemo } from '../../../(usecase)/memo-folder-usecases'

export default function NewFolder (): React.ReactElement {
  const { createNewFolder } = useFolderAndMemo()

  return (
    <div className="tooltip">
      <div onClick={() => {
        createNewFolder().catch((error) => {
          console.debug(error)
        })
      }}>
        <button
          className="text-white hover:text-gray-300 ml-3 mr-3"
          aria-label='newMemo'
          type='button'
        >
          <Image src={newFolder} alt={'newMemo'}
                 className={'white-image'}
                 width={30} height={30}/>
        </button>
        <span className="tooltip-message">새 폴더</span>
      </div>
    </div>
  )
}
