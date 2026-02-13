'use client'

import React, { useRef, useState, useCallback, useEffect } from 'react'

interface TouchDpadProps {
  onMove: (dx: number, dy: number) => void
  disabled?: boolean
}

type Direction = 'up' | 'down' | 'left' | 'right' | null

const LONG_PRESS_INITIAL_DELAY = 280
const LONG_PRESS_REPEAT_INTERVAL = 120
const DEADZONE = 12

function getDirection (dx: number, dy: number): Direction {
  const dist = Math.sqrt(dx * dx + dy * dy)
  if (dist < DEADZONE) return null
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'right' : 'left'
  }
  return dy > 0 ? 'down' : 'up'
}

function getDeltas (dir: Direction): [number, number] {
  switch (dir) {
    case 'up': return [0, -1]
    case 'down': return [0, 1]
    case 'left': return [-1, 0]
    case 'right': return [1, 0]
    default: return [0, 0]
  }
}

export default function TouchDpad ({ onMove, disabled = false }: TouchDpadProps): React.ReactElement {
  const [activeDir, setActiveDir] = useState<Direction>(null)
  const padRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const activeDirRef = useRef<Direction>(null)

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
    return () => { clearTimers() }
  }, [clearTimers])

  const fireDirection = useCallback((dir: Direction) => {
    if (dir === null || disabled) return
    const [dx, dy] = getDeltas(dir)
    onMove(dx, dy)
  }, [disabled, onMove])

  const startDirection = useCallback((dir: Direction) => {
    if (dir === null || disabled) return
    activeDirRef.current = dir
    setActiveDir(dir)
    fireDirection(dir)

    clearTimers()
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        if (activeDirRef.current !== null) {
          const [dx, dy] = getDeltas(activeDirRef.current)
          onMove(dx, dy)
        }
      }, LONG_PRESS_REPEAT_INTERVAL)
    }, LONG_PRESS_INITIAL_DELAY)
  }, [disabled, fireDirection, clearTimers, onMove])

  const stopDirection = useCallback(() => {
    activeDirRef.current = null
    setActiveDir(null)
    clearTimers()
  }, [clearTimers])

  const getDirFromTouch = useCallback((clientX: number, clientY: number): Direction => {
    if (padRef.current === null) return null
    const rect = padRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    return getDirection(clientX - cx, clientY - cy)
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    const dir = getDirFromTouch(touch.clientX, touch.clientY)
    startDirection(dir)
  }, [getDirFromTouch, startDirection])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    const dir = getDirFromTouch(touch.clientX, touch.clientY)
    if (dir !== activeDirRef.current) {
      if (dir !== null) {
        startDirection(dir)
      } else {
        setActiveDir(null)
        activeDirRef.current = null
      }
    }
  }, [getDirFromTouch, startDirection])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    stopDirection()
  }, [stopDirection])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const dir = getDirFromTouch(e.clientX, e.clientY)
    startDirection(dir)
  }, [getDirFromTouch, startDirection])

  const handleMouseUp = useCallback(() => {
    stopDirection()
  }, [stopDirection])

  const arrowColor = (dir: Direction): string => {
    if (disabled) return 'text-gray-700'
    return activeDir === dir ? 'text-green-300' : 'text-green-500/70'
  }

  const arrowScale = (dir: Direction): string => {
    return activeDir === dir ? 'scale-110' : 'scale-100'
  }

  return (
    <div className="fixed bottom-[68px] left-3 z-50">
      <div
        ref={padRef}
        className={`relative select-none rounded-full
          bg-gray-900/90 backdrop-blur-sm border-2 border-gray-600/80
          shadow-lg shadow-black/50
          ${disabled ? 'opacity-50' : ''}`}
        style={{ width: '144px', height: '144px', touchAction: 'none' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Cross groove visual */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Vertical bar */}
          <div className="absolute w-[44px] h-full rounded-full bg-gray-800/60" />
          {/* Horizontal bar */}
          <div className="absolute h-[44px] w-full rounded-full bg-gray-800/60" />
        </div>

        {/* Up arrow */}
        <div className={`absolute top-2 left-1/2 -translate-x-1/2 transition-all duration-75 ${arrowColor('up')} ${arrowScale('up')}`}>
          <svg width="28" height="20" viewBox="0 0 28 20" fill="currentColor">
            <polygon points="14,2 26,18 2,18" />
          </svg>
        </div>

        {/* Down arrow */}
        <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 transition-all duration-75 ${arrowColor('down')} ${arrowScale('down')}`}>
          <svg width="28" height="20" viewBox="0 0 28 20" fill="currentColor">
            <polygon points="14,18 2,2 26,2" />
          </svg>
        </div>

        {/* Left arrow */}
        <div className={`absolute left-2 top-1/2 -translate-y-1/2 transition-all duration-75 ${arrowColor('left')} ${arrowScale('left')}`}>
          <svg width="20" height="28" viewBox="0 0 20 28" fill="currentColor">
            <polygon points="2,14 18,2 18,26" />
          </svg>
        </div>

        {/* Right arrow */}
        <div className={`absolute right-2 top-1/2 -translate-y-1/2 transition-all duration-75 ${arrowColor('right')} ${arrowScale('right')}`}>
          <svg width="20" height="28" viewBox="0 0 20 28" fill="currentColor">
            <polygon points="18,14 2,2 2,26" />
          </svg>
        </div>

        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-700 border border-gray-500/50" />
      </div>
    </div>
  )
}
