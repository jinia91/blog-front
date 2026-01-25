import React, { useCallback, useEffect, useRef, useState } from 'react'
import { type Memo } from '../../(domain)/memo'
import Markdown from 'react-markdown'
import { fetchRelatedMemo } from '../../(infra)/memo'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  recommendations: Memo[]
  onSelect: (value: Memo) => void
  initialQuery?: string
  currentMemoId: string
  setRecommendations: React.Dispatch<React.SetStateAction<Memo[]>>
}

export const RelatedMemoModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  recommendations,
  onSelect,
  initialQuery = '',
  currentMemoId,
  setRecommendations
}) => {
  const [selectedItem, setSelectedItem] = useState(0)
  const [selectedContent, setSelectedContent] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isOpen) {
      setSearchQuery(initialQuery)
      setSelectedItem(0)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }, [isOpen, initialQuery])

  const searchMemos = useCallback(async (query: string): Promise<void> => {
    if (query.trim() === '') {
      setRecommendations([])
      return
    }
    setIsSearching(true)
    try {
      const results = await fetchRelatedMemo(query, currentMemoId)
      if (results !== null) {
        setRecommendations(results)
        setSelectedItem(0)
      }
    } finally {
      setIsSearching(false)
    }
  }, [currentMemoId, setRecommendations])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value
    setSearchQuery(value)

    if (debounceRef.current !== null) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      void searchMemos(value)
    }, 300)
  }

  useEffect(() => {
    const modalControlInput = (event: KeyboardEvent): void => {
      if (!isOpen) return

      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      } else if (event.key === 'ArrowDown' && recommendations.length > 0) {
        event.preventDefault()
        const newIndex = (selectedItem + 1) % recommendations.length
        setSelectedItem(newIndex)
        setSelectedContent(recommendations[newIndex]?.content ?? '')
      } else if (event.key === 'ArrowUp' && recommendations.length > 0) {
        event.preventDefault()
        const newIndex = (selectedItem - 1 + recommendations.length) % recommendations.length
        setSelectedItem(newIndex)
        setSelectedContent(recommendations[newIndex]?.content ?? '')
      } else if (event.key === 'Enter' && recommendations.length > 0) {
        event.preventDefault()
        onSelect(recommendations[selectedItem])
        setSelectedContent('')
      }
    }

    window.addEventListener('keydown', modalControlInput)
    return () => {
      window.removeEventListener('keydown', modalControlInput)
    }
  }, [isOpen, onClose, selectedItem, recommendations, onSelect])

  const handleMouseEnter = (index: number): void => {
    setSelectedItem(index)
    setSelectedContent(recommendations[index].content)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-10 flex items-center justify-center">
      <div className="bg-gray-900 text-green-400 rounded-lg p-4 max-w-xl w-full shadow-xl">
        <div className="flex flex-col">
          {/* Search Input */}
          <div className="mb-3">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="메모 검색..."
              className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-green-400"
            />
          </div>

          {/* Loading indicator */}
          {isSearching && (
            <div className="text-gray-400 text-center py-2">검색 중...</div>
          )}

          {/* Results */}
          <ul className="list-none space-y-2 max-h-80 overflow-y-auto">
            {!isSearching && recommendations.length === 0 && searchQuery !== '' && (
              <li className="text-gray-400 text-center py-2">검색 결과가 없습니다</li>
            )}
            {!isSearching && recommendations.length === 0 && searchQuery === '' && (
              <li className="text-gray-500 text-center py-2">검색어를 입력하세요</li>
            )}
            {recommendations.map((recommendation, index) => (
              <li
                key={recommendation.memoId}
                className={`overflow-y-hidden whitespace-nowrap cursor-pointer p-2 hover:bg-gray-700 rounded transition duration-100 ease-in-out font-mono ${
                  index === selectedItem ? 'bg-gray-700' : ''
                }`}
                onClick={() => {
                  onSelect(recommendation)
                }}
                onMouseOver={() => {
                  handleMouseEnter(index)
                }}
              >
                <span className="text-white">{index === selectedItem ? '-> ' : '  '}</span>
                {recommendation.title !== '' ? recommendation.title : 'Untitled'}
                {selectedItem === index && selectedContent !== '' && (
                  <div
                    className="absolute border-2 p-5 ml-5 bg-gray-800 text-xs text-white rounded shadow-lg transition-transform translate-x-48 w-96 h-72 whitespace-nowrap overflow-scroll">
                    <p className={'text-xl'}>{'<<Preview>>'}</p>
                    <Markdown>{selectedContent}</Markdown>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
