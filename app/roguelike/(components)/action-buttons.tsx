'use client'
import React, { useCallback } from 'react'

interface ActionButtonsProps {
  onAction: () => void
  onInventory: () => void
  canDescend: boolean
  isInventoryOpen: boolean
}

export default function ActionButtons ({
  onAction,
  onInventory,
  canDescend,
  isInventoryOpen
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
    <div className="fixed bottom-8 right-8 z-50">
      <div className="flex items-center gap-4">
        {/* B Button (Inventory) */}
        <button
          onTouchEnd={makeTouchEnd(onInventory)}
          onClick={makeClick(onInventory)}
          className={`w-14 h-14 rounded-full border-2
                      active:scale-95 active:brightness-125
                      transition-all duration-150 flex items-center justify-center
                      shadow-lg
                      ${isInventoryOpen
                        ? 'bg-blue-500 border-blue-300 shadow-blue-400/60 scale-105'
                        : 'bg-blue-700 border-blue-500 hover:bg-blue-600 hover:shadow-blue-400/50'}`}
          aria-label="Toggle inventory"
        >
          <span className="text-white text-xl font-bold">◆</span>
        </button>

        {/* A Button (Main Action) */}
        <button
          onTouchEnd={makeTouchEnd(onAction)}
          onClick={makeClick(onAction)}
          className={`w-20 h-20 rounded-full border-3
                      active:scale-95 active:brightness-125
                      transition-all duration-150 flex items-center justify-center
                      shadow-xl font-bold text-2xl
                      ${canDescend
                        ? 'bg-green-600 border-green-400 text-white shadow-green-400/70 animate-pulse-glow'
                        : isInventoryOpen
                          ? 'bg-amber-600 border-amber-400 text-white shadow-amber-400/60 hover:bg-amber-500'
                          : 'bg-gray-700 border-gray-500 text-gray-400 hover:bg-gray-600 hover:border-gray-400 shadow-gray-600/40'
                      }`}
          aria-label={canDescend ? 'Descend stairs' : isInventoryOpen ? 'Use item' : 'Action'}
        >
          {canDescend ? '▼' : '▶'}
        </button>
      </div>

      {/* Custom pulse-glow animation for stairs */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 1;
            box-shadow: 0 0 20px rgba(34, 197, 94, 0.7), 0 0 40px rgba(34, 197, 94, 0.4);
          }
          50% {
            opacity: 0.85;
            box-shadow: 0 0 30px rgba(34, 197, 94, 0.9), 0 0 60px rgba(34, 197, 94, 0.6);
          }
        }
        .animate-pulse-glow {
          animation: pulse-glow 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
