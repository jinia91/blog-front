'use client'
import MemoSystemNavigator from '@/components/memo/folder_navigator/MemoSystemNavigator'
import React, { useEffect, useState } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { FolderContextProvider } from '@/components/memo/FolderContextProvider'
import { MemoEditContextProvider } from '@/components/memo/MemoEditContextProvider'
import SignInPage from '@/components/auth/SignInPage'
import AdminAccessDenied from '@/components/auth/AccessDeniedPage'
import { useSession } from '@/auth/application/usecase/SessionUseCases'
import { Auth } from '@/auth/application/domain/Session'

export default function MemoFolderContainer ({ children }: { children: React.ReactNode }): React.ReactElement {
  const { session } = useSession()
  console.log('MemoFolderContainer 렌더링 체크 1')
  console.log('MemoFolderContainer session:', session)
  type Direction = 'horizontal' | 'vertical'

  useEffect(() => {
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

  const [direction, setDirection] = useState<Direction>('horizontal')

  return (session == null)
    ? <SignInPage/>
    : (session.roles.values().next().value === Auth.Admin)
        ? (
        <FolderContextProvider>
          <MemoEditContextProvider>
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
                  {children}
                </Panel>
                <PanelResizeHandle className="md:w-2 md:h-full h-2 w-full hover:bg-blue-800"/>
                <Panel
                  defaultSizePercentage={30}
                  className="flex flex-1 overflow-auto"
                  minSizePercentage={20}
                >{(<MemoSystemNavigator
                  className="flex flex-1 min-w-0 flex-col"/>)}
                </Panel>
              </PanelGroup>
            </div>
          </MemoEditContextProvider>
        </FolderContextProvider>
          )
        : <AdminAccessDenied/>
}
