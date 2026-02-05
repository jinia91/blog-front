'use client'
import MemoSystemNavigatorMain from './memo-system-navigator/memo-system-navigator-main'
import React, { useEffect, useState } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import SignInPage from '../../login/(components)/sign-in-page'
import { useSession } from '../../login/(usecase)/session-usecases'
import { useFolderAndMemo } from '../(usecase)/memo-folder-usecases'
import { useMemoSystem } from '../(usecase)/memo-system-usecases'
import { BacklinksPanel } from './memo-editor/backlinks-panel'

const NAVIGATOR_VISIBLE_KEY = 'memo-navigator-visible'
const BACKLINKS_VISIBLE_KEY = 'memo-backlinks-visible'

export default function MemoSystemMain ({ children }: { children: React.ReactNode }): React.ReactElement {
  const { session } = useSession()
  const { initializeFolderAndMemo } = useFolderAndMemo()
  const { memoEditorSharedContext } = useMemoSystem()
  const [mounted, setMounted] = useState(false)
  type Direction = 'horizontal' | 'vertical'
  const [direction, setDirection] = useState<Direction>('horizontal')
  const [navigatorVisible, setNavigatorVisible] = useState(true)
  const [backlinksVisible, setBacklinksVisible] = useState(true)

  useEffect(() => {
    const storedNav = localStorage.getItem(NAVIGATOR_VISIBLE_KEY)
    if (storedNav !== null) {
      setNavigatorVisible(storedNav === 'true')
    }
    const storedBacklinks = localStorage.getItem(BACKLINKS_VISIBLE_KEY)
    if (storedBacklinks !== null) {
      setBacklinksVisible(storedBacklinks === 'true')
    }
  }, [])

  const toggleNavigator = (): void => {
    const newValue = !navigatorVisible
    setNavigatorVisible(newValue)
    localStorage.setItem(NAVIGATOR_VISIBLE_KEY, String(newValue))
  }

  const toggleBacklinks = (): void => {
    const newValue = !backlinksVisible
    setBacklinksVisible(newValue)
    localStorage.setItem(BACKLINKS_VISIBLE_KEY, String(newValue))
  }

  const isSidePanelVisible = navigatorVisible || backlinksVisible

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
          className="dos-font relative"
          style={{ height: '75vh', overflowY: 'auto' }}
        >
          <Panel
            defaultSizePercentage={isSidePanelVisible ? 70 : 100}
            className={'bg-black text-green-400 font-mono p-2 flex flex-grow border-4 overflow-auto'}
            minSizePercentage={20}
          >
            {!mounted
              ? <></>
              : children}
          </Panel>

          {isSidePanelVisible && (
            <>
              <PanelResizeHandle className="md:w-2 md:h-full h-2 w-full hover:bg-blue-800"/>

              <Panel
                defaultSizePercentage={30}
                className="flex flex-col overflow-hidden"
                minSizePercentage={20}
              >
                <PanelGroup direction="vertical" className="flex-1">
                  {/* Navigator Panel */}
                  {navigatorVisible && (
                    <Panel
                      order={1}
                      defaultSizePercentage={backlinksVisible ? 60 : 100}
                      minSizePercentage={20}
                      className="flex flex-col overflow-hidden"
                    >
                      <MemoSystemNavigatorMain
                        className="flex flex-1 min-w-0 flex-col overflow-hidden"
                        onToggleNavigator={toggleNavigator}
                        onToggleBacklinks={toggleBacklinks}
                        backlinksVisible={backlinksVisible}
                      />
                    </Panel>
                  )}

                  {/* Resize Handle - 둘 다 열려있을 때만 */}
                  {navigatorVisible && backlinksVisible && (
                    <PanelResizeHandle className="h-1 w-full hover:bg-blue-800 cursor-row-resize"/>
                  )}

                  {/* Backlinks Panel */}
                  {backlinksVisible && (
                    <Panel
                      order={2}
                      defaultSizePercentage={navigatorVisible ? 40 : 100}
                      minSizePercentage={15}
                      className="flex flex-col overflow-hidden"
                    >
                      {/* Backlinks Header - 탐색기 헤더와 동일한 스타일 */}
                      <div className="flex p-2 flex-row-reverse border-t-2 border-l-2 border-r-2 bg-gray-900 items-center">
                        {/* 닫기 버튼 */}
                        <div className="tooltip">
                          <button
                            onClick={toggleBacklinks}
                            className="text-white hover:text-gray-300 ml-2"
                            title="연관메모 패널 닫기"
                            type="button"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                          <span className="tooltip-message">닫기</span>
                        </div>
                        {/* 탐색기 열기 버튼 (탐색기가 닫혀있을 때만) */}
                        {!navigatorVisible && (
                          <div className="tooltip">
                            <button
                              onClick={toggleNavigator}
                              className="text-white hover:text-gray-300 ml-2"
                              title="탐색기 열기"
                              type="button"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                <polyline points="9 22 9 12 15 12 15 22"/>
                              </svg>
                            </button>
                            <span className="tooltip-message">탐색기</span>
                          </div>
                        )}
                        {/* 제목 */}
                        <span className="mr-auto text-sm text-gray-300">연관메모</span>
                      </div>
                      <div className="flex-1 overflow-auto border-l-2 border-r-2 border-b-2 bg-gray-900">
                        <BacklinksPanel memoId={memoEditorSharedContext.id ?? ''} />
                      </div>
                    </Panel>
                  )}
                </PanelGroup>
              </Panel>
            </>
          )}

          {/* Floating overlay buttons when panels are hidden */}
          {!isSidePanelVisible && (
            <div className="absolute right-2 top-2 z-[10000] flex flex-col gap-1">
              <button
                onClick={toggleNavigator}
                className="text-gray-400 hover:text-green-400 p-1.5 bg-gray-800 border border-gray-600 rounded hover:border-green-400 transition-colors"
                title="탐색기 열기"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="11 17 6 12 11 7"></polyline>
                  <polyline points="18 17 13 12 18 7"></polyline>
                </svg>
              </button>
              <button
                onClick={toggleBacklinks}
                className="text-gray-400 hover:text-green-400 p-1.5 bg-gray-800 border border-gray-600 rounded hover:border-green-400 transition-colors"
                title="백링크 패널 열기"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
              </button>
            </div>
          )}
        </PanelGroup>
      </div>
      )
}
