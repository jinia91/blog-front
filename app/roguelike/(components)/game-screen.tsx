'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { type GameState, Tile } from '../(domain)/types'
import { initFloor, movePlayer, descend, useItem, dropItem, rangedAttack, buyShopItem, resolveEvent, cancelEvent, renderGame } from '../(domain)/game-engine'
import { getEventById } from '../(domain)/events'
import { AnsiLine } from './ansi-renderer'
import TouchDpad from './touch-dpad'
import ActionButtons from './action-buttons'
import MobileHud from './mobile-hud'
import TouchInventory from './touch-inventory'
import TouchStats from './touch-stats'
import TouchEvent from './touch-event'

function detectMobileLayout (): boolean {
  if (typeof window === 'undefined') return false
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches
  const touchCapable = navigator.maxTouchPoints > 0
  const shortEdge = Math.min(window.innerWidth, window.innerHeight)
  const narrowViewport = shortEdge <= 900 || window.innerWidth <= 900
  return coarsePointer || touchCapable || narrowViewport
}

export default function GameScreen ({ onQuit }: { onQuit: () => void }): React.ReactElement {
  const initialState = initFloor(1, null)
  const gameStateRef = useRef<GameState>(initialState)
  const [viewLines, setViewLines] = useState<string[]>(() => renderGame(gameStateRef.current, true))

  const onQuitRef = useRef(onQuit)
  useEffect(() => {
    onQuitRef.current = onQuit
  }, [onQuit])

  // Mobile detection
  const [isMobile, setIsMobile] = useState(true)
  const isMobileRef = useRef(isMobile)
  useEffect(() => {
    const check = (): void => {
      setIsMobile(detectMobileLayout())
    }
    check()
    window.addEventListener('resize', check)
    window.addEventListener('orientationchange', check)
    return () => {
      window.removeEventListener('resize', check)
      window.removeEventListener('orientationchange', check)
    }
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
      const mobile = detectMobileLayout()
      if (mobile) {
        // 34 chars total width in compact mode (VIEW_WIDTH + 2 borders = 34)
        const viewportWidth = Math.max(320, window.innerWidth)
        const charWidth = (viewportWidth - 20) / 34
        const fs = Math.min(Math.max(charWidth * 1.32, 5.5), 11.5)
        setFontSize(`${fs}px`)
      } else {
        setFontSize('12px')
      }
    }
    calcFontSize()
    window.addEventListener('resize', calcFontSize)
    window.addEventListener('orientationchange', calcFontSize)
    return () => {
      window.removeEventListener('resize', calcFontSize)
      window.removeEventListener('orientationchange', calcFontSize)
    }
  }, [])

  // Derived state for mobile UI (since gameStateRef doesn't trigger re-renders)
  const [canDescend, setCanDescend] = useState(
    initialState.map.tiles[initialState.player.pos.y][initialState.player.pos.x] === Tile.Stairs
  )
  const [isInvOpen, setIsInvOpen] = useState(false)
  const [isStatsOpen, setIsStatsOpen] = useState(false)
  const [isShopOpen, setIsShopOpen] = useState(false)
  const [isOnShopTile, setIsOnShopTile] = useState(false)
  const [isEventActive, setIsEventActive] = useState(false)
  const [hasRangedWeapon, setHasRangedWeapon] = useState((initialState.player.weapon?.range ?? 1) > 1)

  // --- Shared action callbacks ---

  const updateState = useCallback((newState: GameState): void => {
    gameStateRef.current = newState
    setViewLines(renderGame(newState, isMobileRef.current))
    setCanDescend(newState.map.tiles[newState.player.pos.y][newState.player.pos.x] === Tile.Stairs)
    setIsInvOpen(newState.invOpen)
    setIsShopOpen(newState.shopOpen)
    setIsOnShopTile(newState.map.tiles[newState.player.pos.y][newState.player.pos.x] === Tile.Shop)
    setIsEventActive(newState.activeEvent !== null)
    setHasRangedWeapon((newState.player.weapon?.range ?? 1) > 1)
  }, [])

  const handleMove = useCallback((dx: number, dy: number): void => {
    const current = gameStateRef.current
    if (current.over || current.won || current.invOpen || current.activeEvent !== null) return
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
    if (newState.player.inventory.length > 0 && newState.invIdx >= newState.player.inventory.length) {
      newState = { ...newState, invIdx: newState.player.inventory.length - 1 }
    }
    updateState(newState)
  }, [updateState])

  const handleSelectItem = useCallback((idx: number): void => {
    const current = gameStateRef.current
    updateState({ ...current, invIdx: idx })
  }, [updateState])

  const handleDropItemAction = useCallback((idx: number): void => {
    const current = gameStateRef.current
    let newState = dropItem(current, idx)
    if (newState.player.inventory.length === 0) {
      newState = { ...newState, invIdx: 0 }
    } else if (newState.invIdx >= newState.player.inventory.length) {
      newState = { ...newState, invIdx: newState.player.inventory.length - 1 }
    }
    updateState(newState)
  }, [updateState])

  const handleRangedAction = useCallback((): void => {
    const current = gameStateRef.current
    if (current.over || current.won || current.invOpen || current.shopOpen || current.activeEvent !== null) return
    updateState(rangedAttack(current))
  }, [updateState])

  const handleQuit = useCallback((): void => {
    onQuitRef.current()
  }, [])

  const handleStatsToggle = useCallback((): void => {
    setIsStatsOpen(prev => !prev)
  }, [])

  const handleShopExit = useCallback((): void => {
    const current = gameStateRef.current
    if (current.shopOpen) {
      updateState({ ...current, shopOpen: false })
    }
  }, [updateState])

  const handleEventSelect = useCallback((idx: number): void => {
    const current = gameStateRef.current
    if (current.activeEvent === null) return
    updateState({ ...current, eventIdx: idx })
  }, [updateState])

  const handleEventConfirm = useCallback((): void => {
    const current = gameStateRef.current
    if (current.activeEvent === null) return
    updateState(resolveEvent(current))
  }, [updateState])

  const handleEventCancel = useCallback((): void => {
    const current = gameStateRef.current
    if (current.activeEvent === null) return
    updateState(cancelEvent(current))
  }, [updateState])

  // D-pad wrapper: handles shop/inventory navigation when open
  const handleDpadMove = useCallback((dx: number, dy: number): void => {
    const current = gameStateRef.current
    if (current.activeEvent !== null) {
      const eventDef = getEventById(current.activeEvent.eventId)
      if (eventDef === undefined) return
      const choiceCount = eventDef.choices.length
      if (dy === -1) {
        const newIdx = current.eventIdx > 0 ? current.eventIdx - 1 : choiceCount - 1
        updateState({ ...current, eventIdx: newIdx })
      } else if (dy === 1) {
        const newIdx = current.eventIdx < choiceCount - 1 ? current.eventIdx + 1 : 0
        updateState({ ...current, eventIdx: newIdx })
      }
      return
    }
    if (current.shopOpen) {
      const shopLen = current.shopItems.length
      if (shopLen === 0) return
      if (dy === -1) {
        const newIdx = current.shopIdx > 0 ? current.shopIdx - 1 : shopLen - 1
        updateState({ ...current, shopIdx: newIdx })
      } else if (dy === 1) {
        const newIdx = current.shopIdx < shopLen - 1 ? current.shopIdx + 1 : 0
        updateState({ ...current, shopIdx: newIdx })
      }
      return
    }
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
    if (current.activeEvent !== null) {
      updateState(resolveEvent(current))
      return
    }
    if (current.shopOpen) {
      const newState = buyShopItem(current, current.shopIdx)
      updateState(newState)
      return
    }
    if (current.invOpen) {
      handleUseItemAction(current.invIdx)
      return
    }
    // If on shop tile and not in shop, open shop
    if (current.map.tiles[current.player.pos.y][current.player.pos.x] === Tile.Shop) {
      updateState({ ...current, shopOpen: true, shopIdx: 0 })
      return
    }
    handleDescend()
  }, [handleDescend, handleUseItemAction, updateState])

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

    if (current.activeEvent !== null) {
      const eventDef = getEventById(current.activeEvent.eventId)
      if (eventDef === undefined) return
      const choiceCount = eventDef.choices.length

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          e.preventDefault()
          updateState({
            ...current,
            eventIdx: current.eventIdx > 0 ? current.eventIdx - 1 : choiceCount - 1
          })
          break
        case 'ArrowDown':
        case 's':
          e.preventDefault()
          updateState({
            ...current,
            eventIdx: current.eventIdx < choiceCount - 1 ? current.eventIdx + 1 : 0
          })
          break
        case 'Enter':
          e.preventDefault()
          updateState(resolveEvent(current))
          break
        case 'Escape':
          e.preventDefault()
          updateState(cancelEvent(current))
          break
        default:
          return
      }
      return
    }

    if (current.shopOpen) {
      let newState = current
      const shopLen = current.shopItems.length

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          e.preventDefault()
          if (shopLen > 0) {
            const newIdx = current.shopIdx > 0 ? current.shopIdx - 1 : shopLen - 1
            newState = { ...current, shopIdx: newIdx }
          }
          break
        case 'ArrowDown':
          e.preventDefault()
          if (shopLen > 0) {
            const newIdx = current.shopIdx < shopLen - 1 ? current.shopIdx + 1 : 0
            newState = { ...current, shopIdx: newIdx }
          }
          break
        case 'Enter':
          e.preventDefault()
          if (shopLen > 0) {
            newState = buyShopItem(current, current.shopIdx)
          }
          break
        case 's':
        case 'S':
        case 'Escape':
          e.preventDefault()
          newState = { ...current, shopOpen: false }
          break
        default:
          return
      }

      updateState(newState)
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
            if (newState.player.inventory.length > 0 && newState.invIdx >= newState.player.inventory.length) {
              newState = { ...newState, invIdx: newState.player.inventory.length - 1 }
            }
          }
          break
        case 'x':
        case 'X':
        case 'Delete':
          e.preventDefault()
          if (invLen > 0) {
            newState = dropItem(current, current.invIdx)
            if (newState.player.inventory.length === 0) {
              newState = { ...newState, invIdx: 0 }
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

    // Shop key: uppercase S to open shop when on shop tile
    if (e.key === 'S') {
      e.preventDefault()
      if (current.map.tiles[current.player.pos.y][current.player.pos.x] === Tile.Shop) {
        updateState({ ...current, shopOpen: true, shopIdx: 0 })
      } else {
        // Treat as normal 's' movement
        const newState = movePlayer(current, 0, 1)
        if (newState !== null) updateState(newState)
      }
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
      case 'f':
      case 'F':
        e.preventDefault()
        newState = rangedAttack(current)
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
        className="font-mono leading-tight select-none inline-block mx-auto"
        style={{
          fontSize,
          touchAction: 'none',
          width: isMobile ? '34ch' : 'fit-content',
          maxWidth: '100vw',
          overflowX: 'hidden',
          paddingInline: '2px'
        }}
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
          themeName={gameStateRef.current.currentTheme.name}
          themeIcon={gameStateRef.current.currentTheme.icon}
          onToggleInventory={handleInventoryToggle}
          isInventoryOpen={isInvOpen}
          onToggleStats={handleStatsToggle}
        />
      )}

      {/* Touch Controls - only on mobile */}
      {isMobile && !gameStateRef.current.over && !gameStateRef.current.won && (
        <>
          <TouchDpad onMove={handleDpadMove} />
          <ActionButtons
            onAction={handleAction}
            onRanged={handleRangedAction}
            onExitShop={handleShopExit}
            canDescend={canDescend}
            hasRangedWeapon={hasRangedWeapon}
            isInventoryOpen={isInvOpen}
            isOnShopTile={isOnShopTile}
            isShopOpen={isShopOpen}
            isEventActive={isEventActive}
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
          onDropItem={handleDropItemAction}
          onClose={handleInventoryToggle}
        />
      )}

      {/* Touch Stats - overlay on mobile when stats is open */}
      {isMobile && isStatsOpen && (
        <TouchStats
          player={gameStateRef.current.player}
          floor={gameStateRef.current.floor}
          turns={gameStateRef.current.turns}
          kills={gameStateRef.current.kills}
          themeName={gameStateRef.current.currentTheme.name}
          themeIcon={gameStateRef.current.currentTheme.icon}
          onClose={handleStatsToggle}
        />
      )}

      {/* Touch Event - overlay on mobile when event is active */}
      {isMobile && isEventActive && gameStateRef.current.activeEvent !== null && (
        <TouchEvent
          eventId={gameStateRef.current.activeEvent.eventId}
          selectedIdx={gameStateRef.current.eventIdx}
          player={gameStateRef.current.player}
          onSelectChoice={handleEventSelect}
          onConfirm={handleEventConfirm}
          onCancel={handleEventCancel}
        />
      )}

      {/* Game Over/Victory touch support on mobile */}
      {isMobile && (gameStateRef.current.over || gameStateRef.current.won) && (
        <div
          className="absolute inset-0 flex items-end justify-center pb-20"
          onClick={handleQuit}
        >
          <div className="bg-gray-800 border border-gray-600 px-6 py-3 rounded-lg animate-pulse cursor-pointer">
            <span className="text-green-400 font-mono text-sm">탭하여 나가기</span>
          </div>
        </div>
      )}
    </div>
  )
}
