'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { type GameState } from '../(domain)/types'
import { initFloor, movePlayer, descend, useItem, renderGame } from '../(domain)/game-engine'
import { AnsiLine } from './ansi-renderer'

export default function GameScreen ({ onQuit }: { onQuit: () => void }): React.ReactElement {
  const gameStateRef = useRef<GameState>(initFloor(1, null))
  const [viewLines, setViewLines] = useState<string[]>(() => renderGame(gameStateRef.current))

  const onQuitRef = useRef(onQuit)
  useEffect(() => {
    onQuitRef.current = onQuit
  }, [onQuit])

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

      gameStateRef.current = newState
      setViewLines(renderGame(newState))
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
    gameStateRef.current = newState
    setViewLines(renderGame(newState))
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => { window.removeEventListener('keydown', handleKeyDown) }
  }, [handleKeyDown])

  return (
    <div className="flex flex-col items-center">
      <div className="font-mono text-xs leading-tight select-none">
        {viewLines.map((line, i) => (
          <pre key={i} style={{ margin: 0 }} className="whitespace-pre">
            <AnsiLine line={line} />
          </pre>
        ))}
      </div>
    </div>
  )
}
