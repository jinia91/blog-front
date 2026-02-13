'use client'

import React, { useCallback } from 'react'
import type { InvItem, Player } from '../(domain)/types'

interface TouchInventoryProps {
  player: Player
  selectedIdx: number
  onSelectItem: (idx: number) => void
  onUseItem: (idx: number) => void
  onDropItem: (idx: number) => void
  onClose: () => void
}

export default function TouchInventory ({
  player,
  selectedIdx,
  onSelectItem,
  onUseItem,
  onDropItem,
  onClose
}: TouchInventoryProps): React.ReactElement {
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

  const handleContentClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  const handleItemClick = useCallback((idx: number) => {
    if (selectedIdx === idx) {
      onUseItem(idx)
    } else {
      onSelectItem(idx)
    }
  }, [selectedIdx, onSelectItem, onUseItem])

  const renderItemIcon = (item: InvItem | null): string => {
    if (item === null) return '□'
    switch (item.kind) {
      case 'weapon': return '⚔'
      case 'armor': return '🛡'
      case 'potion': return item.data.healType === 'hp' ? '♥' : '★'
    }
  }

  const renderItemText = (item: InvItem | null): string => {
    if (item === null) return '---'
    switch (item.kind) {
      case 'weapon': return `${item.data.name} ATK+${item.data.atk} SPD${item.data.speed ?? (item.data.range !== undefined && item.data.range >= 4 ? 3 : 2)}`
      case 'armor': return `${item.data.name} DEF+${item.data.def}`
      case 'potion': return `${item.data.name} ${item.data.healType.toUpperCase()}+${item.data.value}`
    }
  }

  const getItemIconColor = (item: InvItem | null): string => {
    if (item === null) return 'text-gray-600'
    switch (item.kind) {
      case 'weapon': return 'text-amber-400'
      case 'armor': return 'text-blue-400'
      case 'potion': return item.data.healType === 'hp' ? 'text-green-400' : 'text-orange-400'
    }
  }

  const inventorySlots = Array.from({ length: 8 }, (_, i) => player.inventory[i] ?? null)

  const isEquipped = (idx: number): boolean => {
    const item = inventorySlots[idx]
    if (item === null) return false
    if (item.kind === 'weapon' && player.weapon !== null) {
      return item.data.name === player.weapon.name
    }
    if (item.kind === 'armor' && player.armor !== null) {
      return item.data.name === player.armor.name
    }
    return false
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
          <h2 className="text-xl font-bold text-cyan-400 dos-font">인벤토리</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            aria-label="Close inventory"
          >
            ✕
          </button>
        </div>

        {/* Equipped Items */}
        <div className="px-4 py-3 border-b border-gray-700 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 bg-gray-800 rounded">
            <span className="text-xl text-amber-400">⚔</span>
            <div className="flex-1">
              <div className="text-xs text-gray-500">무기</div>
              <div className="text-sm text-white">
                {player.weapon !== null ? `${player.weapon.name} ATK+${player.weapon.atk}` : '없음'}
              </div>
            </div>
            {player.weapon !== null && (
              <span className="text-xs text-cyan-400 border border-cyan-400/50 px-2 py-0.5 rounded">
                장착중
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 px-3 py-2 bg-gray-800 rounded">
            <span className="text-xl text-blue-400">🛡</span>
            <div className="flex-1">
              <div className="text-xs text-gray-500">방어구</div>
              <div className="text-sm text-white">
                {player.armor !== null ? `${player.armor.name} DEF+${player.armor.def}` : '없음'}
              </div>
            </div>
            {player.armor !== null && (
              <span className="text-xs text-cyan-400 border border-cyan-400/50 px-2 py-0.5 rounded">
                장착중
              </span>
            )}
          </div>
        </div>

        {/* Item List */}
        <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
          {inventorySlots.map((item, idx) => {
            const isSelected = selectedIdx === idx
            const isEmpty = item === null
            const equipped = isEquipped(idx)

            return (
              <div
                key={idx}
                role="button"
                tabIndex={isEmpty ? -1 : 0}
                onClick={() => { if (!isEmpty) handleItemClick(idx) }}
                onKeyDown={(e) => {
                  if (isEmpty) return
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleItemClick(idx)
                  }
                }}
                className={`
                  w-full min-h-[48px] flex items-center gap-3 px-3 py-2 rounded transition-all
                  ${isEmpty ? 'bg-gray-800/50 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-700 active:bg-gray-600'}
                  ${isSelected && !isEmpty ? 'bg-gray-700 border-l-4 border-cyan-400' : 'border-l-4 border-transparent'}
                `}
              >
                {/* Icon */}
                <span className={`text-2xl ${getItemIconColor(item)}`}>
                  {renderItemIcon(item)}
                </span>

                {/* Text */}
                <div className="flex-1 text-left">
                  <div className={`text-sm ${isEmpty ? 'text-gray-600' : 'text-white'}`}>
                    {renderItemText(item)}
                  </div>
                  {equipped && (
                    <div className="text-xs text-cyan-400 mt-0.5">장착중</div>
                  )}
                </div>

                {/* Use/Unequip Button */}
                {isSelected && !isEmpty && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDropItem(idx)
                      }}
                      className="px-2 py-1 text-xs font-bold border rounded text-red-300 border-red-400 hover:bg-red-400/15"
                    >
                      버리기
                    </button>
                    <div className={`px-3 py-1 text-xs font-bold border rounded ${
                      equipped
                        ? 'text-orange-400 border-orange-400 hover:bg-orange-400/10'
                        : 'text-cyan-400 border-cyan-400 hover:bg-cyan-400/10'
                    }`}>
                      {equipped ? '해제' : '사용'}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-700 text-center text-xs text-gray-400">
          탭하여 선택, 다시 탭하여 사용, 선택 후 버리기 가능
        </div>
      </div>
    </div>
  )
}
