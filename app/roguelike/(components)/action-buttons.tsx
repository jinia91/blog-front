'use client'
import React, { useCallback } from 'react'

interface ActionButtonsProps {
  onAction: () => void
  onInventory: () => void
  onStats: () => void
  canDescend: boolean
  isInventoryOpen: boolean
  isStatsOpen: boolean
  isOnShopTile?: boolean
  isShopOpen?: boolean
  isEventActive?: boolean
}

export default function ActionButtons ({
  onAction,
  onInventory,
  onStats,
  canDescend,
  isInventoryOpen,
  isStatsOpen,
  isOnShopTile = false,
  isShopOpen = false,
  isEventActive = false
}: ActionButtonsProps): React.ReactElement {
  const touchedRef = React.useRef(false)

  const makeTouchEnd = useCallback((callback: () => void) => {
    return (e: React.TouchEvent): void => {
      e.preventDefault()
      touchedRef.current = true
      callback()
    }
  }, [])

  const makeClick = useCallback((callback: () => void) => {
    return (): void => {
      if (touchedRef.current) {
        touchedRef.current = false
        return
      }
      callback()
    }
  }, [])

  return (
    <div className="fixed bottom-[68px] right-3 z-50">
      {/* Diamond layout like SNES controller */}
      <div className="relative" style={{ width: '120px', height: '120px' }}>
        {/* Top: Stats button */}
        <button
          onTouchEnd={makeTouchEnd(onStats)}
          onClick={makeClick(onStats)}
          className={`absolute left-1/2 -translate-x-1/2 top-0
                      w-10 h-10 rounded-full border-2
                      active:scale-90 active:brightness-125
                      transition-all duration-100 flex items-center justify-center
                      shadow-md text-[10px] font-bold
                      ${isStatsOpen
                        ? 'bg-purple-500 border-purple-300 shadow-purple-400/50 text-white'
                        : 'bg-purple-800/90 border-purple-500/70 text-purple-300'}`}
          aria-label="Toggle stats"
        >
          ST
        </button>

        {/* Left: Inventory button */}
        <button
          onTouchEnd={makeTouchEnd(onInventory)}
          onClick={makeClick(onInventory)}
          className={`absolute top-1/2 -translate-y-1/2 left-0
                      w-11 h-11 rounded-full border-2
                      active:scale-90 active:brightness-125
                      transition-all duration-100 flex items-center justify-center
                      shadow-md
                      ${isInventoryOpen
                        ? 'bg-blue-500 border-blue-300 shadow-blue-400/50'
                        : 'bg-blue-800/90 border-blue-500/70'}`}
          aria-label="Toggle inventory"
        >
          <span className="text-white text-sm font-bold">{'\u25C6'}</span>
        </button>

        {/* Right/Center: Main Action button (largest) */}
        <button
          onTouchEnd={makeTouchEnd(onAction)}
          onClick={makeClick(onAction)}
          className={`absolute top-1/2 -translate-y-1/2 right-0
                      w-14 h-14 rounded-full border-2
                      active:scale-90 active:brightness-125
                      transition-all duration-100 flex items-center justify-center
                      shadow-lg font-bold text-lg
                      ${canDescend
                        ? 'bg-green-600 border-green-400 text-white shadow-green-400/60 animate-pulse-glow'
                        : isEventActive
                          ? 'bg-purple-600 border-purple-400 text-white shadow-purple-400/50'
                          : isShopOpen
                            ? 'bg-yellow-600 border-yellow-400 text-white shadow-yellow-400/50'
                            : isInventoryOpen
                              ? 'bg-amber-600 border-amber-400 text-white shadow-amber-400/50'
                              : isOnShopTile
                                ? 'bg-yellow-700 border-yellow-500 text-yellow-200 shadow-yellow-400/40'
                                : 'bg-gray-700/90 border-gray-500/70 text-gray-400'
                      }`}
          aria-label={canDescend ? 'Descend stairs' : isEventActive ? 'Confirm event choice' : isShopOpen ? 'Buy item' : isInventoryOpen ? 'Use item' : isOnShopTile ? 'Open shop' : 'Action'}
        >
          {canDescend ? '\u25BC' : isEventActive ? '✓' : isShopOpen ? '$' : isOnShopTile ? '\u25A0' : '\u25B6'}
        </button>
      </div>

      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 12px rgba(34, 197, 94, 0.6), 0 0 24px rgba(34, 197, 94, 0.3);
          }
          50% {
            box-shadow: 0 0 20px rgba(34, 197, 94, 0.8), 0 0 40px rgba(34, 197, 94, 0.5);
          }
        }
        .animate-pulse-glow {
          animation: pulse-glow 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
