import React, { useEffect, useRef } from 'react'
import Image from 'next/image'
import search from '../../../../../public/search.png'
import { useDebouncedCallback } from 'use-debounce'
import { useFolderAndMemo } from '../../../(usecase)/memo-folder-usecases'
import { useMemoSystem } from '../../../(usecase)/memo-system-usecases'
import { NavigatorContextType } from '../../../(domain)/memo-system-navigator-context'

export function MemoSearch (): React.ReactElement {
  const inputRef = useRef<HTMLInputElement>(null)
  const { navigatorContext, toggleSearchMode } = useMemoSystem()
  const { searchMemosByKeyword, initializeFolderAndMemo } = useFolderAndMemo()
  const previousNavigatorTypeRef = useRef(navigatorContext.type)

  useEffect(() => {
    if (
      previousNavigatorTypeRef.current === NavigatorContextType.SEARCH_MODE &&
      navigatorContext.type !== NavigatorContextType.SEARCH_MODE
    ) {
      void initializeFolderAndMemo()
    }
    previousNavigatorTypeRef.current = navigatorContext.type

    if ((navigatorContext.type === NavigatorContextType.SEARCH_MODE) && (inputRef.current != null)) {
      inputRef.current.focus()
    }
    const searchModeKeyboardAction = async (event: KeyboardEvent): Promise<void> => {
      if (event.ctrlKey && (event.key === 'f' || event.key === 'ㄹ')) {
        event.preventDefault()
        toggleSearchMode()
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    window.addEventListener('keydown', searchModeKeyboardAction)

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      window.removeEventListener('keydown', searchModeKeyboardAction)
    }
  }, [navigatorContext])

  const searchMemoCallBack = useDebouncedCallback(async (value: string) => {
    await searchMemosByKeyword(value)
  }, 300)

  const searchDataCallback = (value: string): void => {
    void searchMemoCallBack(value)
  }
  return (
    <div className={`flex flex-row ${navigatorContext.type === NavigatorContextType.SEARCH_MODE ? 'w-full' : ''}`}>
      <div className={`tooltip flex ${navigatorContext.type === NavigatorContextType.SEARCH_MODE ? 'pr-2' : ''}`}>
        <button
          className="text-white hover:text-gray-300"
          aria-label='search'
          type='button'
          onClick={() => {
            toggleSearchMode()
          }}
        >
          <Image src={search} alt={'검색'} width={30} height={30}/>
        </button>
        <span className="tooltip-message">검색</span>
      </div>
      {navigatorContext.type === NavigatorContextType.SEARCH_MODE && (
        <input
          ref={inputRef}
          type="text"
          className="flex w-10/12 bg-gray-800 border border-gray-700 text-white p-1 transition-all duration-500"
          placeholder="검색..."
          onInput={(e) => {
            const value = e.currentTarget.value
            searchDataCallback(value)
          }}/>
      )}
    </div>
  )
}
