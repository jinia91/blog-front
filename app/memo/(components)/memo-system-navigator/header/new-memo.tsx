'use client'

import React, { useEffect } from 'react'
import Image from 'next/image'
import newMemo from '../../../../../public/newMemo.png'
import { useFolderAndMemo } from '../../../(usecase)/memo-folder-usecases'
import { useTabs } from '../../../../(layout)/(usecase)/tab-usecases'

export default function NewMemo (): React.ReactElement {
  const { createNewMemo } = useFolderAndMemo()
  const { upsertAndSelectTab } = useTabs()

  const createNewMemoAndUpdateTab = async (): Promise<void> => {
    const newMemoId = await createNewMemo()
    upsertAndSelectTab({ name: '새 메모', urlPath: `/memo/${newMemoId}` })
  }

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent): Promise<void> => {
      if ((event.ctrlKey && event.key === 'n') || (event.ctrlKey && event.key === 'ㅜ')) {
        event.preventDefault()
        await createNewMemoAndUpdateTab().catch(console.error)
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [createNewMemoAndUpdateTab])

  return (
    <div className="tooltip">
      <div onClick={() => {
        createNewMemoAndUpdateTab().catch(console.error)
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
