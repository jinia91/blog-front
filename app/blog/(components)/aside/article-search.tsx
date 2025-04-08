'use client'
import React from 'react'
import { FiSearch } from 'react-icons/fi'
import { useRouter, useSearchParams } from 'next/navigation'

export const ArticleSearchInput = (): React.ReactElement => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const keyword = searchParams.get('keyword') ?? ''

  const inputRef = React.useRef<HTMLInputElement>(null)
  const isComposingRef = React.useRef(false)
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null)

  const updateKeyword = (): void => {
    const inputValue = inputRef.current?.value?.trim() ?? ''
    const params = new URLSearchParams(searchParams.toString())
    if (inputValue === '') {
      params.delete('keyword')
      params.delete('tag')
      params.delete('mode')
    } else {
      params.delete('tag')
      params.delete('mode')
      params.set('keyword', inputValue)
    }
    router.push(`?${params.toString()}`)
  }

  function reset (): void {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('keyword')
    params.delete('tag')
    params.delete('mode')
    router.push('/blog')
    if (inputRef.current != null) {
      inputRef.current.value = ''
    }
    inputRef.current?.blur()
  }

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        reset()
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
        defaultValue={keyword}
        onInput={(e) => {
          if (!isComposingRef.current) {
            if (debounceRef.current != null) clearTimeout(debounceRef.current)
            debounceRef.current = setTimeout(updateKeyword, 100)
          }
        }}
        onCompositionStart={() => {
          isComposingRef.current = true
        }}
        onCompositionEnd={() => {
          isComposingRef.current = false
          updateKeyword()
        }}
        placeholder="검색어를 입력하세요..."
        className="w-full pl-10 pr-8 p-2 bg-gray-900 text-white border border-green-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200 hover:border-green-300 hover:bg-gray-800"
      />
      {(keyword !== '') && (
        <button
          type="button"
          onClick={() => {
            reset()
          }}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:text-green-300"
        >
          ×
        </button>
      )}
    </div>
  )
}
