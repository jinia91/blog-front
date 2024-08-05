'use client'
import MemoSystemNavigatorMain from './memo-system-navigator/memo-system-navigator-main'
import React, { useEffect, useState } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import SignInPage from '../../login/(components)/sign-in-page'
import AdminAccessDenied from '../../login/(components)/access-denied-page'
import { useSession } from '../../login/(usecase)/session-usecases'
import { Auth } from '../../login/(domain)/session'
import { useFolderAndMemo } from '../(usecase)/memo-folder-usecases'

export default function MemoSystemMain ({ children }: { children: React.ReactNode }): React.ReactElement {
  const { session } = useSession()
  const { initialization } = useFolderAndMemo()
  const [mounted, setMounted] = useState(false)
  type Direction = 'horizontal' | 'vertical'
  const [direction, setDirection] = useState<Direction>('horizontal')

  console.log('MemoSystemMain 렌더링 체크 1')
  console.log('MemoSystemMain session:', session)

  useEffect(() => {
    initialization().then(() => {
      setMounted(true)
    }).catch(error => {
      console.error(error)
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

  return (session == null)
    ? <SignInPage/>
    : (session.roles.values().next().value === Auth.Admin)
        ? (
        <div className="flex-grow">
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
        : <AdminAccessDenied/>
}
