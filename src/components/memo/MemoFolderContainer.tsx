import MemoSystemNavigator from '@/components/memo/folder_navigator/MemoSystemNavigator'
import React, { useContext, useEffect, useState } from 'react'
import { type MixedSizes, Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { getLocalStorage, setLocalStorage } from '@/utils/localStorage'
import { FolderContext, FolderContextProvider } from '@/components/memo/folder_navigator/FolderContextProvider'
import { MemoEditContextProvider } from '@/components/memo/folder_navigator/MemoEditContextProvider'

export default function MemoFolderContainer ({ children }: { children: React.ReactNode }): React.ReactElement {
  const { folders } = useContext(FolderContext)

  const onLayout = (layout: MixedSizes[]): void => {
    setLocalStorage('react-resizable-panels:layout', layout)
  }
  type Direction = 'horizontal' | 'vertical'
  const defaultLayout = getLocalStorage<MixedSizes[] | null>('react-resizable-panels:layout')

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

  return (
    <FolderContextProvider>
      <MemoEditContextProvider>
        <div className="flex-grow">
          <PanelGroup
            direction={direction}
            className="dos-font"
            style={{ height: '75vh', overflowY: 'auto' }}
            onLayout={onLayout}
          >
            <Panel
              defaultSizePercentage={(defaultLayout != null) ? defaultLayout[0].sizePercentage : 70}
              className={'bg-black text-green-400 font-mono p-2 flex flex-grow border-4 overflow-auto'}
              minSizePercentage={20}
            >
              {children}
            </Panel>
            <PanelResizeHandle className="md:w-2 md:h-full h-2 w-full hover:bg-blue-800"/>
            <Panel
              defaultSizePercentage={(defaultLayout != null) ? defaultLayout[1].sizePercentage : 30}
              className="flex flex-1 overflow-auto"
              minSizePercentage={20}
            >{(folders != null) && (<MemoSystemNavigator
              className="flex flex-1 min-w-0 flex-col"/>)}
            </Panel>
          </PanelGroup>
        </div>
      </MemoEditContextProvider>
    </FolderContextProvider>
  )
}
