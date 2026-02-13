'use client'

import React, { useCallback } from 'react'
import type { Player } from '../(domain)/types'
import { getEventById } from '../(domain)/events'

interface TouchEventProps {
  eventId: string
  selectedIdx: number
  player: Player
  onSelectChoice: (idx: number) => void
  onConfirm: () => void
  onCancel: () => void
}

export default function TouchEvent ({
  eventId,
  selectedIdx,
  player,
  onSelectChoice,
  onConfirm,
  onCancel
}: TouchEventProps): React.ReactElement | null {
  const eventDef = getEventById(eventId)
  if (eventDef === undefined) return null

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel()
    }
  }, [onCancel])

  const handleContentClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  const handleChoiceClick = useCallback((idx: number) => {
    if (selectedIdx === idx) {
      onConfirm()
    } else {
      onSelectChoice(idx)
    }
  }, [selectedIdx, onSelectChoice, onConfirm])

  const getCategoryIcon = (): string => {
    switch (eventDef.category) {
      case 'choice': return '✦'
      case 'trap': return '⚠'
      case 'npc': return '👤'
      case 'puzzle': return '◆'
    }
  }

  const getCategoryColor = (): string => {
    switch (eventDef.category) {
      case 'choice': return 'text-cyan-400'
      case 'trap': return 'text-red-400'
      case 'npc': return 'text-green-400'
      case 'puzzle': return 'text-purple-400'
    }
  }

  const getCategoryLabel = (): string => {
    switch (eventDef.category) {
      case 'choice': return '이벤트'
      case 'trap': return '함정'
      case 'npc': return 'NPC'
      case 'puzzle': return '퍼즐'
    }
  }

  const canAffordChoice = (idx: number): boolean => {
    const choice = eventDef.choices[idx]
    if (choice.requiresGold !== undefined && player.gold < choice.requiresGold) return false
    if (choice.requiresHp !== undefined && player.stats.hp <= choice.requiresHp) return false
    return true
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-md mx-4 bg-gray-900 border border-gray-600 rounded-lg shadow-2xl"
        onClick={handleContentClick}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <span className={`text-lg ${getCategoryColor()}`}>{getCategoryIcon()}</span>
            <div>
              <h2 className="text-lg font-bold text-cyan-400 dos-font">{eventDef.name}</h2>
              <span className={`text-xs ${getCategoryColor()}`}>{getCategoryLabel()}</span>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            aria-label="Close event"
          >
            ✕
          </button>
        </div>

        {/* Description */}
        <div className="px-4 py-3 border-b border-gray-700">
          {eventDef.description.map((line, i) => (
            <p key={i} className="text-sm text-gray-300 leading-relaxed">{line}</p>
          ))}
        </div>

        {/* Choices */}
        <div className="p-4 space-y-2">
          {eventDef.choices.map((choice, idx) => {
            const isSelected = selectedIdx === idx
            const affordable = canAffordChoice(idx)

            return (
              <button
                key={idx}
                onClick={() => { handleChoiceClick(idx) }}
                className={`
                  w-full min-h-[56px] flex flex-col px-4 py-3 rounded-lg transition-all text-left
                  ${!affordable ? 'opacity-50' : ''}
                  ${isSelected
                    ? 'bg-gray-700 border-2 border-cyan-400 shadow-lg shadow-cyan-400/20'
                    : 'bg-gray-800 border-2 border-transparent hover:bg-gray-700 active:bg-gray-600'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${isSelected ? 'text-cyan-400' : 'text-white'}`}>
                    {idx + 1}. {choice.label}
                  </span>
                  {choice.requiresGold !== undefined && (
                    <span className="text-xs text-yellow-400 border border-yellow-400/50 px-1.5 py-0.5 rounded">
                      {choice.requiresGold}G
                    </span>
                  )}
                  {choice.requiresHp !== undefined && (
                    <span className="text-xs text-red-400 border border-red-400/50 px-1.5 py-0.5 rounded">
                      -{choice.requiresHp}HP
                    </span>
                  )}
                  {choice.skillCheck !== undefined && (
                    <span className="text-xs text-blue-400 border border-blue-400/50 px-1.5 py-0.5 rounded">
                      {choice.skillCheck.stat === 'str' ? 'STR' : 'DEF'} 체크
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400 mt-1">{choice.description}</span>
                {isSelected && (
                  <div className="mt-2 text-xs text-cyan-400 font-bold">
                    탭하여 선택
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-700 text-center text-xs text-gray-400">
          탭하여 선택, 다시 탭하여 결정
        </div>
      </div>
    </div>
  )
}
