'use client'
import MemoSystemNavigatorMain from './memo-system-navigator/memo-system-navigator-main'
import React, { useEffect, useState } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import SignInPage from '../../login/(components)/sign-in-page'
import { useSession } from '../../login/(usecase)/session-usecases'
import { useFolderAndMemo } from '../(usecase)/memo-folder-usecases'

export default function MemoSystemMain ({ children }: { children: React.ReactNode }): React.ReactElement {
  const { session } = useSession()
  const { initializeFolderAndMemo } = useFolderAndMemo()
  const [mounted, setMounted] = useState(false)
  type Direction = 'horizontal' | 'vertical'
  const [direction, setDirection] = useState<Direction>('horizontal')

  useEffect(() => {
    initializeFolderAndMemo().then(() => {
      setMounted(true)
    }).catch(error => {
      console.debug(error)
    })

    const handleResize = (): void => {
      if (window.innerWidth <= 768) {
        setDirection('vertical')
      } else {
        setDirection('horizontal')
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (session === null)
    ? <SignInPage/>
    : (
      <div className="flex-grow">
        {session.roles.values().next().value === 'USER' &&
          <div
            className="bg-red-500 text-white text-center">{'메모 앱은 저의 개인 데이터 관리 프로젝트로, 일반 유저의 데이터는 매주 월요일 삭제됩니다'}</div>}
        <PanelGroup
          direction={direction}
          className="dos-font"
          style={{ height: '75vh', overflowY: 'auto' }}
        >
          <Panel
            defaultSizePercentage={70}
            className={'bg-black text-green-400 font-mono p-2 flex flex-grow border-4 overflow-auto'}
            minSizePercentage={20}
          >
            {!mounted
              ? <></>
              : children}
          </Panel>

          <PanelResizeHandle className="md:w-2 md:h-full h-2 w-full hover:bg-blue-800"/>

          <Panel
            defaultSizePercentage={30}
            className="flex flex-1 overflow-auto"
            minSizePercentage={20}
          >{<MemoSystemNavigatorMain
            className="flex flex-1 min-w-0 flex-col"/>}
          </Panel>
        </PanelGroup>
      </div>
      )
}
