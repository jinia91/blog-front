'use client'
import React, { useState, useEffect, useCallback } from 'react'

type Phase = 'booting' | 'title'

const BOOT_LINES = [
  '> INITIALIZING DUNGEON CORE...',
  '> LOADING MONSTERS... [████████] OK',
  '> GENERATING MAPS... [████████] OK',
  '> ALL SYSTEMS READY.',
  '',
  '> PRESS ANY KEY TO CONTINUE...'
]

const FLAME_FRAMES = ['( )', '{*}', '(+)', '{ }', '(*)', '{ }']

const TITLE_ART = [
  ' ____   ___   ____ _   _ _____',
  '|  _ \\ / _ \\ / ___| | | | ____|',
  '| |_) | | | | |  _| | | |  _|',
  '|  _ <| |_| | |_| | |_| | |___',
  '|_| \\_\\\\___/ \\____|\\___/|_____|'
]

export default function TitleScreen ({ onStart }: { onStart: () => void }): React.ReactElement {
  const [phase, setPhase] = useState<Phase>('booting')
  const [bootLine, setBootLine] = useState(0)
  const [blink, setBlink] = useState(true)
  const [flameFrame, setFlameFrame] = useState(0)
  const [cursorBlink, setCursorBlink] = useState(true)

  useEffect(() => {
    if (phase !== 'booting') return
    if (bootLine >= BOOT_LINES.length) {
      const timer = setTimeout(() => {
        setPhase('title')
      }, 800)
      return () => {
        clearTimeout(timer)
      }
    }
    const timer = setTimeout(() => {
      setBootLine(prev => prev + 1)
    }, 400)
    return () => {
      clearTimeout(timer)
    }
  }, [phase, bootLine])

  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(prev => !prev)
    }, 600)
    return () => {
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCursorBlink(prev => !prev)
    }, 300)
    return () => {
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setFlameFrame(prev => (prev + 1) % FLAME_FRAMES.length)
    }, 200)
    return () => {
      clearInterval(interval)
    }
  }, [])

  const skipBoot = useCallback(() => {
    if (phase === 'booting') {
      setPhase('title')
    }
  }, [phase])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent): void => {
      if (phase === 'booting') {
        skipBoot()
        return
      }
      if (e.key === 'Enter') {
        onStart()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('keydown', handleKey)
    }
  }, [phase, onStart, skipBoot])

  if (phase === 'booting') {
    return (
      <div className="font-mono text-xs leading-tight select-none cursor-pointer" style={{ padding: '16px' }} onClick={skipBoot}>
        <pre style={{ margin: 0, color: '#00ff00', marginBottom: '8px' }}>
          {'═'.repeat(40)}
        </pre>
        <pre style={{ margin: 0, color: '#ffaa00', marginBottom: '12px' }}>
          {'  '}DUNGEON CORE SYSTEM v1.0
        </pre>
        <pre style={{ margin: 0, color: '#00ff00', marginBottom: '12px' }}>
          {'═'.repeat(40)}
        </pre>
        {BOOT_LINES.slice(0, bootLine).map((line, i) => (
          <pre key={i} style={{ margin: 0, color: '#00ff00', marginBottom: '2px' }}>
            {line}
          </pre>
        ))}
        {bootLine < BOOT_LINES.length && (
          <pre style={{ margin: 0, color: '#00ff00' }}>
            {cursorBlink ? '█' : ' '}
          </pre>
        )}
      </div>
    )
  }

  const flame = FLAME_FRAMES[flameFrame]
  const startButtonColor = blink ? '#ffffff' : '#444444'

  return (
    <div className="font-mono text-xs leading-tight select-none" style={{ padding: '10px' }}>
      <div style={{ marginBottom: '8px' }}>
        {TITLE_ART.map((line, i) => (
          <pre key={i} style={{ margin: 0, color: '#ff4444' }}>
            {line}
          </pre>
        ))}
      </div>

      <pre style={{ margin: 0, color: '#ffcc00', textAlign: 'center', marginBottom: '8px' }}>
        {flame} DUNGEON CRAWLER {flame}
      </pre>

      <pre style={{ margin: 0, color: '#888888', textAlign: 'center', marginBottom: '4px' }}>
        ─── 10 FLOORS OF DARKNESS ───
      </pre>
      <pre style={{ margin: 0, color: '#888888', textAlign: 'center', marginBottom: '12px' }}>
        SLAY THE DRAGON · CLAIM GLORY
      </pre>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
        <div className="cursor-pointer" onClick={onStart}>
          <pre style={{ margin: 0, color: '#666666' }}>
            ╔══════════════════════════╗
          </pre>
          <pre style={{ margin: 0, color: startButtonColor, textAlign: 'center' }}>
            ║ ▶ TAP OR PRESS ENTER ║
          </pre>
          <pre style={{ margin: 0, color: '#666666' }}>
            ╚══════════════════════════╝
          </pre>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
          <pre style={{ margin: 0, color: '#555555' }}>
            [WASD/Swipe] Move
          </pre>
          <pre style={{ margin: 0, color: '#555555' }}>
            [I/Tap] Inventory
          </pre>
          <pre style={{ margin: 0, color: '#555555' }}>
            [Q] Quit
          </pre>
        </div>
        <pre style={{ margin: 0, color: '#555555', textAlign: 'center' }}>
          [Tap] Use/Attack/Pickup
        </pre>
      </div>
    </div>
  )
}
