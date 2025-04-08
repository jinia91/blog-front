'use client'
import React from 'react'
import { FiSearch } from 'react-icons/fi'
import { useRouter, useSearchParams } from 'next/navigation'

export const ArticleSearchInput = (): React.ReactElement => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const keyword = searchParams.get('keyword') ?? ''

  const inputRef = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        const params = new URLSearchParams(searchParams.toString())
        params.delete('keyword')
        params.delete('tag')
        params.delete('mode')
        router.push(`?${params.toString()}`)
        inputRef.current?.blur()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [searchParams, router])

  return (
    <div className="relative w-full">
      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400"/>
      <input
        ref={inputRef}
        type="text"
        value={keyword}
        onInput={(e) => {
          const inputValue = e.currentTarget.value
          const params = new URLSearchParams(searchParams.toString())
          if (inputValue.trim() === '') {
            params.delete('keyword')
          } else {
            params.set('keyword', inputValue)
          }
          router.push(`?${params.toString()}`)
        }}
        placeholder="검색어를 입력하세요..."
        className="w-full pl-10 pr-8 p-2 bg-gray-900 text-white border border-green-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200 hover:border-green-300 hover:bg-gray-800"
      />
      {(keyword !== '') && (
        <button
          type="button"
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString())
            params.delete('keyword')
            router.push(`?${params.toString()}`)
            inputRef.current?.blur()
          }}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:text-green-300"
        >
          ×
        </button>
      )}
    </div>
  )
}
