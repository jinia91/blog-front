'use client'

import React, { useRef, useCallback, useEffect } from 'react'

interface TouchDpadProps {
  onMove: (dx: number, dy: number) => void
  disabled?: boolean
}

type Direction = 'up' | 'down' | 'left' | 'right'

const LONG_PRESS_INITIAL_DELAY = 300
const LONG_PRESS_REPEAT_INTERVAL = 150

export default function TouchDpad ({ onMove, disabled = false }: TouchDpadProps): React.ReactElement {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const clearTimers = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      clearTimers()
    }
  }, [clearTimers])

  const getDirectionDeltas = (direction: Direction): [number, number] => {
    switch (direction) {
      case 'up':
        return [0, -1]
      case 'down':
        return [0, 1]
      case 'left':
        return [-1, 0]
      case 'right':
        return [1, 0]
    }
  }

  const handleStart = useCallback((direction: Direction) => {
    if (disabled) return

    const [dx, dy] = getDirectionDeltas(direction)

    // Fire immediately
    onMove(dx, dy)

    // Set up long press behavior
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        onMove(dx, dy)
      }, LONG_PRESS_REPEAT_INTERVAL)
    }, LONG_PRESS_INITIAL_DELAY)
  }, [disabled, onMove])

  const handleEnd = useCallback(() => {
    clearTimers()
  }, [clearTimers])

  const createButtonHandlers = (direction: Direction): {
    onMouseDown: (e: React.MouseEvent) => void
    onMouseUp: () => void
    onMouseLeave: () => void
    onTouchStart: (e: React.TouchEvent) => void
    onTouchEnd: (e: React.TouchEvent) => void
  } => ({
    onMouseDown: (e: React.MouseEvent) => {
      e.preventDefault()
      handleStart(direction)
    },
    onMouseUp: handleEnd,
    onMouseLeave: handleEnd,
    onTouchStart: (e: React.TouchEvent) => {
      e.preventDefault()
      handleStart(direction)
    },
    onTouchEnd: (e: React.TouchEvent) => {
      e.preventDefault()
      handleEnd()
    }
  })

  const buttonBaseClass = `
    flex items-center justify-center
    w-14 h-14
    text-2xl
    bg-gray-800 border-2
    rounded-lg
    select-none
    transition-all duration-75
    ${disabled
      ? 'border-gray-700 text-gray-600 cursor-not-allowed'
      : 'border-gray-600 text-green-400 cursor-pointer hover:border-green-400 hover:bg-gray-700 active:scale-95 active:brightness-125'
    }
  `.trim().replace(/\s+/g, ' ')

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <div className="grid grid-cols-3 gap-1.5 w-[200px] h-[200px] bg-gray-900/80 backdrop-blur-sm p-2 rounded-xl border border-gray-700">
        {/* Top row */}
        <div className="w-14 h-14" />
        <button
          type="button"
          className={buttonBaseClass}
          disabled={disabled}
          {...createButtonHandlers('up')}
        >
          ▲
        </button>
        <div className="w-14 h-14" />

        {/* Middle row */}
        <button
          type="button"
          className={buttonBaseClass}
          disabled={disabled}
          {...createButtonHandlers('left')}
        >
          ◄
        </button>
        <div className="flex items-center justify-center w-14 h-14">
          <div className="w-3 h-3 bg-gray-700 rounded-full border border-gray-600" />
        </div>
        <button
          type="button"
          className={buttonBaseClass}
          disabled={disabled}
          {...createButtonHandlers('right')}
        >
          ►
        </button>

        {/* Bottom row */}
        <div className="w-14 h-14" />
        <button
          type="button"
          className={buttonBaseClass}
          disabled={disabled}
          {...createButtonHandlers('down')}
        >
          ▼
        </button>
        <div className="w-14 h-14" />
      </div>
    </div>
  )
}
