'use client'

import React from 'react'
import Image from 'next/image'
import newFolder from '../../../../../public/newFolder.png'
import { useFolder } from '@/memo/application/usecase/folder-usecases'

export default function NewFolder (): React.ReactElement {
  const { createNewFolder } = useFolder()

  return (
    <div className="tooltip">
      <div onClick={() => {
        createNewFolder().catch((error) => {
          console.log(error)
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
