'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { type Memo } from '../../(domain)/memo'
import { fetchRelatedMemo } from '../../(infra)/memo'

interface InlineLinkPopupProps {
  isOpen: boolean
  searchText: string
  currentMemoId: string
  onSelect: (memo: Memo) => void
  onClose: () => void
  position: { top: number, left: number }
}

export function InlineLinkPopup ({
  isOpen,
  searchText,
  currentMemoId,
  onSelect,
  onClose,
  position
}: InlineLinkPopupProps): React.ReactElement | null {
  const [results, setResults] = useState<Memo[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const searchMemos = useCallback(async (query: string): Promise<void> => {
    if (query.trim() === '') {
      setResults([])
      return
    }
    setIsLoading(true)
    try {
      const fetchedResults = await fetchRelatedMemo(query, currentMemoId)
      if (fetchedResults !== null) {
        setResults(fetchedResults.slice(0, 5)) // Max 5 results
        setSelectedIndex(0)
      }
    } finally {
      setIsLoading(false)
    }
  }, [currentMemoId])

  useEffect(() => {
    if (!isOpen) return

    if (debounceRef.current !== null) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      void searchMemos(searchText)
    }, 200)

    return () => {
      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [isOpen, searchText, searchMemos])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        e.stopPropagation()
        setSelectedIndex(prev => (prev + 1) % Math.max(results.length, 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        e.stopPropagation()
        setSelectedIndex(prev => (prev - 1 + results.length) % Math.max(results.length, 1))
      } else if (e.key === 'Enter' && results.length > 0) {
        e.preventDefault()
        e.stopPropagation()
        onSelect(results[selectedIndex])
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown, true)
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [isOpen, results, selectedIndex, onSelect, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={popupRef}
      className="fixed z-50 bg-gray-800 border border-gray-600 rounded shadow-lg min-w-64 max-w-80"
      style={{ top: position.top, left: position.left }}
    >
      {isLoading && (
        <div className="px-3 py-2 text-gray-400 text-sm">검색 중...</div>
      )}
      {!isLoading && results.length === 0 && searchText !== '' && (
        <div className="px-3 py-2 text-gray-400 text-sm">결과 없음</div>
      )}
      {!isLoading && results.length === 0 && searchText === '' && (
        <div className="px-3 py-2 text-gray-500 text-sm">메모 제목 입력...</div>
      )}
      {results.length > 0 && (
        <ul className="py-1">
          {results.map((memo, index) => (
            <li
              key={memo.memoId}
              className={`px-3 py-1.5 cursor-pointer text-sm truncate ${
                index === selectedIndex ? 'bg-gray-700 text-green-400' : 'text-white hover:bg-gray-700'
              }`}
              onClick={() => { onSelect(memo) }}
              onMouseEnter={() => { setSelectedIndex(index) }}
            >
              {memo.title !== '' ? memo.title : 'Untitled'}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
