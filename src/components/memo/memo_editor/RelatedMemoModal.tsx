'use client'

import React, { useEffect, useState } from 'react'
import { type Memo } from '@/memo/application/domain/memo'
import Markdown from 'react-markdown'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  recommendations: Memo[]
  onSelect: (value: Memo) => void
}

export const RelatedMemoModal: React.FC<ModalProps> = ({ isOpen, onClose, recommendations, onSelect }) => {
  const [selectedItem, setSelectedItem] = useState(0)
  const [selectedContent, setSelectedContent] = useState<string>('')

  useEffect(() => {
    const modalControlInput = (event: KeyboardEvent): void => {
      setSelectedContent('')
      if (!isOpen) return
      if (['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(event.key)) {
        event.preventDefault()
        event.stopPropagation()
      }

      if (event.key === 'Escape') {
        onClose()
      } else if (event.key === 'ArrowDown') {
        setSelectedItem((prev) => (prev + 1) % recommendations.length)
        setSelectedContent(recommendations[selectedItem].content)
      } else if (event.key === 'ArrowUp') {
        setSelectedItem((prev) => (prev - 1 + recommendations.length) % recommendations.length)
        setSelectedContent(recommendations[selectedItem].content)
      } else if (event.key === 'Enter' && recommendations.length > 0) {
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
          <ul className="list-none space-y-2">
            {recommendations.length === 0 && (
              <li className="text-white text-center">결과 없음</li>
            )}
            {
              recommendations.map((recommendation, index) => (
                <li
                  key={index}
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
                  {recommendation.title}
                  {selectedItem === index && (selectedContent !== '') && (
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
