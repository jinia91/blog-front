import { type FolderInfo } from '@/api/models'
import React, { type Dispatch, type SetStateAction, useEffect, useRef } from 'react'
import Image from 'next/image'
import search from '../../../../../public/search.png'
import { useDebouncedCallback } from 'use-debounce'
import { fetchSearchResults } from '@/api/memo'

export function Search ({ foldersRef, setFoldersRef, isInputVisible, setInputVisible }: {
  foldersRef: FolderInfo[]
  setFoldersRef: Dispatch<SetStateAction<FolderInfo[]>>
  isInputVisible: boolean
  setInputVisible: Dispatch<SetStateAction<boolean>>
}): React.ReactElement {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isInputVisible && (inputRef.current != null)) {
      inputRef.current.focus()
    }
  }, [isInputVisible])

  const searchData = useDebouncedCallback(async (value: string) => {
    try {
      const folders = await fetchSearchResults(value)
      if (folders == null) {
        console.log('fetchSearchResults error')
        return
      }
      setFoldersRef(folders)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  },
  300
  )
  useEffect(() => {
    const moveTab = async (event: KeyboardEvent): Promise<void> => {
      if (event.ctrlKey && (event.key === 'f' || event.key === 'ㄹ')) {
        event.preventDefault()
        setInputVisible(!isInputVisible)
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    window.addEventListener('keydown', moveTab)

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      window.removeEventListener('keydown', moveTab)
    }
  }, [isInputVisible])

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const folders = await fetchSearchResults('')
        if (folders == null) {
          return
        }
        setFoldersRef(folders)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    if (!isInputVisible) {
      void fetchData()
    }
  }, [isInputVisible])
  const searchDataCallback = (value: string): void => {
    void searchData(value)
  }
  return (
    <div className={`flex flex-row ${isInputVisible ? 'w-full' : ''}`}>
      <div className={`tooltip flex ${isInputVisible ? 'pr-2' : ''}`}>
        <button
          className="text-white hover:text-gray-300"
          aria-label='search'
          type='button'
          onClick={() => {
            setInputVisible(!isInputVisible)
          }}
        >
          <Image src={search} alt={'검색'} width={30} height={30}/>
        </button>
        <span className="tooltip-message">검색</span>
      </div>
      {isInputVisible && (
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
