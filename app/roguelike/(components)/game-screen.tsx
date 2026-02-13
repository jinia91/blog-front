'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { type GameState, Tile } from '../(domain)/types'
import { initFloor, movePlayer, descend, useItem, renderGame } from '../(domain)/game-engine'
import { AnsiLine } from './ansi-renderer'
import TouchDpad from './touch-dpad'
import ActionButtons from './action-buttons'
import MobileHud from './mobile-hud'
import TouchInventory from './touch-inventory'

export default function GameScreen ({ onQuit }: { onQuit: () => void }): React.ReactElement {
  const initialState = initFloor(1, null)
  const gameStateRef = useRef<GameState>(initialState)
  const [viewLines, setViewLines] = useState<string[]>(() => renderGame(gameStateRef.current))

  const onQuitRef = useRef(onQuit)
  useEffect(() => {
    onQuitRef.current = onQuit
  }, [onQuit])

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false)
  const isMobileRef = useRef(false)
  useEffect(() => {
    const check = (): void => {
      setIsMobile(window.innerWidth < 768)
    }
    check()
    window.addEventListener('resize', check)
    return () => { window.removeEventListener('resize', check) }
  }, [])

  useEffect(() => {
    isMobileRef.current = isMobile
  }, [isMobile])

  // Re-render when isMobile changes
  useEffect(() => {
    setViewLines(renderGame(gameStateRef.current, isMobile))
  }, [isMobile])

  // Responsive font scaling for mobile
  const [fontSize, setFontSize] = useState('12px')
  useEffect(() => {
    const calcFontSize = (): void => {
      if (window.innerWidth < 768) {
        // 34 chars total width in compact mode (VIEW_WIDTH + 2 borders = 34)
        const charWidth = (window.innerWidth - 16) / 34
        const fs = Math.min(Math.max(charWidth * 1.6, 6), 14)
        setFontSize(`${fs}px`)
      } else {
        setFontSize('12px')
      }
    }
    calcFontSize()
    window.addEventListener('resize', calcFontSize)
    return () => { window.removeEventListener('resize', calcFontSize) }
  }, [])

  // Derived state for mobile UI (since gameStateRef doesn't trigger re-renders)
  const [canDescend, setCanDescend] = useState(
    initialState.map.tiles[initialState.player.pos.y][initialState.player.pos.x] === Tile.Stairs
  )
  const [isInvOpen, setIsInvOpen] = useState(false)

  // --- Shared action callbacks ---

  const updateState = useCallback((newState: GameState): void => {
    gameStateRef.current = newState
    setViewLines(renderGame(newState, isMobileRef.current))
    setCanDescend(newState.map.tiles[newState.player.pos.y][newState.player.pos.x] === Tile.Stairs)
    setIsInvOpen(newState.invOpen)
  }, [])

  const handleMove = useCallback((dx: number, dy: number): void => {
    const current = gameStateRef.current
    if (current.over || current.won || current.invOpen) return
    const newState = movePlayer(current, dx, dy)
    if (newState !== null) updateState(newState)
  }, [updateState])

  const handleInventoryToggle = useCallback((): void => {
    const current = gameStateRef.current
    if (current.over || current.won) return
    if (current.invOpen) {
      updateState({ ...current, invOpen: false })
    } else {
      updateState({ ...current, invOpen: true, invIdx: 0 })
    }
  }, [updateState])

  const handleDescend = useCallback((): void => {
    const current = gameStateRef.current
    if (current.over || current.won) return
    const newState = descend(current)
    updateState(newState)
  }, [updateState])

  const handleUseItemAction = useCallback((idx: number): void => {
    const current = gameStateRef.current
    let newState = useItem(current, idx)
    if (newState.player.inventory.length === 0) {
      newState = { ...newState, invOpen: false, invIdx: 0 }
    } else if (newState.invIdx >= newState.player.inventory.length) {
      newState = { ...newState, invIdx: newState.player.inventory.length - 1 }
    }
    updateState(newState)
  }, [updateState])

  const handleSelectItem = useCallback((idx: number): void => {
    const current = gameStateRef.current
    updateState({ ...current, invIdx: idx })
  }, [updateState])

  const handleQuit = useCallback((): void => {
    onQuitRef.current()
  }, [])

  // D-pad wrapper: handles inventory navigation when inv is open
  const handleDpadMove = useCallback((dx: number, dy: number): void => {
    const current = gameStateRef.current
    if (current.invOpen) {
      const invLen = current.player.inventory.length
      if (invLen === 0) return
      if (dy === -1) { // up
        const newIdx = current.invIdx > 0 ? current.invIdx - 1 : invLen - 1
        updateState({ ...current, invIdx: newIdx })
      } else if (dy === 1) { // down
        const newIdx = current.invIdx < invLen - 1 ? current.invIdx + 1 : 0
        updateState({ ...current, invIdx: newIdx })
      }
      return
    }
    handleMove(dx, dy)
  }, [handleMove, updateState])

  // Main action button handler
  const handleAction = useCallback((): void => {
    const current = gameStateRef.current
    if (current.over || current.won) {
      onQuitRef.current()
      return
    }
    if (current.invOpen) {
      handleUseItemAction(current.invIdx)
      return
    }
    handleDescend()
  }, [handleDescend, handleUseItemAction])

  // Swipe gesture handling on map area
  const touchStartRef = useRef<{ x: number, y: number } | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent): void => {
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent): void => {
    if (touchStartRef.current === null) return
    const touch = e.changedTouches[0]
    const dx = touch.clientX - touchStartRef.current.x
    const dy = touch.clientY - touchStartRef.current.y
    touchStartRef.current = null
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)
    if (Math.max(absDx, absDy) < 20) return // too short
    if (absDx > absDy) {
      handleMove(dx > 0 ? 1 : -1, 0)
    } else {
      handleMove(0, dy > 0 ? 1 : -1)
    }
  }, [handleMove])

  // --- Keyboard handling (desktop) ---

  const handleKeyDown = useCallback((e: KeyboardEvent): void => {
    const current = gameStateRef.current

    if (current.over || current.won) {
      if (e.key === 'q' || e.key === 'Q' || e.key === 'Escape') {
        onQuitRef.current()
      }
      return
    }

    if (current.invOpen) {
      let newState = current
      const invLen = current.player.inventory.length

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          e.preventDefault()
          if (invLen > 0) {
            const newIdx = current.invIdx > 0 ? current.invIdx - 1 : invLen - 1
            newState = { ...current, invIdx: newIdx }
          }
          break
        case 'ArrowDown':
        case 's':
          e.preventDefault()
          if (invLen > 0) {
            const newIdx = current.invIdx < invLen - 1 ? current.invIdx + 1 : 0
            newState = { ...current, invIdx: newIdx }
          }
          break
        case 'Enter':
          e.preventDefault()
          if (invLen > 0) {
            newState = useItem(current, current.invIdx)
            if (newState.player.inventory.length === 0) {
              newState = { ...newState, invOpen: false, invIdx: 0 }
            } else if (newState.invIdx >= newState.player.inventory.length) {
              newState = { ...newState, invIdx: newState.player.inventory.length - 1 }
            }
          }
          break
        case 'i':
        case 'I':
        case 'Escape':
          e.preventDefault()
          newState = { ...current, invOpen: false }
          break
        default:
          return
      }

      updateState(newState)
      return
    }

    let newState: GameState | null = null

    switch (e.key) {
      case 'w':
      case 'ArrowUp':
        e.preventDefault()
        newState = movePlayer(current, 0, -1)
        break
      case 's':
      case 'ArrowDown':
        e.preventDefault()
        newState = movePlayer(current, 0, 1)
        break
      case 'a':
      case 'ArrowLeft':
        e.preventDefault()
        newState = movePlayer(current, -1, 0)
        break
      case 'd':
      case 'ArrowRight':
        e.preventDefault()
        newState = movePlayer(current, 1, 0)
        break
      case 'i':
      case 'I':
        e.preventDefault()
        newState = { ...current, invOpen: true, invIdx: 0 }
        break
      case '>':
      case 'Enter':
        e.preventDefault()
        newState = descend(current)
        break
      case 'q':
      case 'Q':
        e.preventDefault()
        onQuitRef.current()
        return
      default:
        return
    }

    if (newState === null) return
    updateState(newState)
  }, [updateState])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => { window.removeEventListener('keydown', handleKeyDown) }
  }, [handleKeyDown])

  return (
    <div className="flex flex-col items-center w-full relative">
      {/* ANSI Game View */}
      <div
        className="font-mono leading-tight select-none"
        style={{ fontSize, touchAction: 'none' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {viewLines.map((line, i) => (
          <pre key={i} style={{ margin: 0 }} className="whitespace-pre">
            <AnsiLine line={line} />
          </pre>
        ))}
      </div>

      {/* Mobile HUD - shown below ANSI view on mobile */}
      {isMobile && (
        <MobileHud
          player={gameStateRef.current.player}
          floor={gameStateRef.current.floor}
          log={gameStateRef.current.log}
        />
      )}

      {/* Touch Controls - only on mobile */}
      {isMobile && !gameStateRef.current.over && !gameStateRef.current.won && (
        <>
          <TouchDpad onMove={handleDpadMove} />
          <ActionButtons
            onAction={handleAction}
            onInventory={handleInventoryToggle}
            canDescend={canDescend}
            isInventoryOpen={isInvOpen}
          />
        </>
      )}

      {/* Touch Inventory - overlay on mobile when inventory is open */}
      {isMobile && isInvOpen && (
        <TouchInventory
          player={gameStateRef.current.player}
          selectedIdx={gameStateRef.current.invIdx}
          onSelectItem={handleSelectItem}
          onUseItem={handleUseItemAction}
          onClose={handleInventoryToggle}
        />
      )}

      {/* Game Over/Victory touch support on mobile */}
      {isMobile && (gameStateRef.current.over || gameStateRef.current.won) && (
        <div
          className="absolute inset-0 flex items-end justify-center pb-20"
          onClick={handleQuit}
        >
          <div className="bg-gray-800 border border-gray-600 px-6 py-3 rounded-lg animate-pulse cursor-pointer">
            <span className="text-green-400 font-mono text-sm">TAP TO EXIT</span>
          </div>
        </div>
      )}
    </div>
  )
}
