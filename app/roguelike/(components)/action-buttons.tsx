'use client'
import React, { useCallback } from 'react'

interface ActionButtonsProps {
  onAction: () => void
  onRanged: () => void
  onExitShop: () => void
  canDescend: boolean
  hasRangedWeapon: boolean
  isInventoryOpen: boolean
  isOnShopTile?: boolean
  isShopOpen?: boolean
  isEventActive?: boolean
}

export default function ActionButtons ({
  onAction,
  onRanged,
  onExitShop,
  canDescend,
  hasRangedWeapon,
  isInventoryOpen,
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

  const actionLabel = '상호작용'

  const actionColor = canDescend
    ? 'bg-green-600 border-green-400 text-white'
    : isEventActive
      ? 'bg-purple-600 border-purple-400 text-white'
      : isShopOpen
        ? 'bg-yellow-600 border-yellow-400 text-white'
        : isOnShopTile
          ? 'bg-yellow-700 border-yellow-500 text-white'
          : 'bg-cyan-700 border-cyan-400 text-white'

  return (
    <div
      className="fixed right-2 z-50 md:right-3"
      style={{ bottom: 'calc(56px + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="w-[170px] rounded-xl border border-gray-700 bg-black/55 backdrop-blur-md p-2 shadow-xl shadow-black/40">
        <div className={`grid ${isShopOpen ? 'grid-cols-1 gap-2' : 'grid-cols-2 gap-2'}`}>
          {isShopOpen && (
            <button
              onTouchEnd={makeTouchEnd(onExitShop)}
              onClick={makeClick(onExitShop)}
              className="h-10 rounded-lg border text-[12px] font-bold transition-all bg-red-700/95 border-red-400 text-white active:scale-95 active:brightness-110"
              aria-label="Exit shop"
            >
              나가기
            </button>
          )}

          <button
            onTouchEnd={makeTouchEnd(onRanged)}
            onClick={makeClick(onRanged)}
            disabled={!hasRangedWeapon || isInventoryOpen || isShopOpen || isEventActive}
            className={`h-11 rounded-lg border text-[12px] font-bold transition-all
                        ${!hasRangedWeapon || isInventoryOpen || isShopOpen || isEventActive
                          ? 'bg-gray-800/80 border-gray-600 text-gray-500'
                          : 'bg-indigo-700/90 border-indigo-400 text-indigo-100 active:scale-95 active:brightness-110'}`}
            aria-label="Ranged action"
          >
            사격
          </button>

          <button
            onTouchEnd={makeTouchEnd(onAction)}
            onClick={makeClick(onAction)}
            className={`h-11 rounded-lg border text-[12px] font-bold transition-all ${actionColor} active:scale-95 active:brightness-110`}
            aria-label="Primary action"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
