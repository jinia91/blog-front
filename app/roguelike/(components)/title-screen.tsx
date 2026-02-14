'use client'
import React, { useState, useEffect, useCallback } from 'react'

type Phase = 'booting' | 'title'

const BOOT_LINES = [
  '> 어비스 OS 초기화 중...',
  '> 몬스터 로딩... [████] OK',
  '> 심연 생성 중... [████] OK',
  '> 모든 시스템 준비 완료.',
  '',
  '> 화면 터치 또는 엔터로 계속...'
]

const FLAME_FRAMES = ['(~)', '{x}', '(*)', '{~}', '(x)', '{*}']

const TITLE_ART = [
  '      ,---.',
  '     / x x \\',
  '    |  ___  |',
  '     \\ |=| /',
  '      \'---\'',
  '    /|     |\\',
  '   d-+-----+-b',
  '',
  '  ╔════════════╗',
  '  ║ 심 연 탐 색 ║',
  '  ║ 크 롤 러   ║',
  '  ╚════════════╝',
  '  .:;:..:;:..:;:.'
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
      <div
        className="font-mono text-xs leading-tight select-none cursor-pointer"
        style={{
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
        onClick={skipBoot}
      >
        <pre style={{ margin: 0, color: '#009900', marginBottom: '8px', textAlign: 'center' }}>
          {'═'.repeat(30)}
        </pre>
        <pre style={{ margin: 0, color: '#883333', marginBottom: '12px', textAlign: 'center' }}>
          {'  '}어비스 OS v0.1
        </pre>
        <pre style={{ margin: 0, color: '#009900', marginBottom: '12px', textAlign: 'center' }}>
          {'═'.repeat(30)}
        </pre>
        {BOOT_LINES.slice(0, bootLine).map((line, i) => (
          <pre key={i} style={{ margin: 0, color: '#009900', marginBottom: '2px', textAlign: 'center' }}>
            {line}
          </pre>
        ))}
        {bootLine < BOOT_LINES.length && (
          <pre style={{ margin: 0, color: '#009900', textAlign: 'center' }}>
            {cursorBlink ? '█' : ' '}
          </pre>
        )}
      </div>
    )
  }

  const flame = FLAME_FRAMES[flameFrame]
  const startButtonColor = blink ? '#cc6666' : '#333333'

  return (
    <div
      className="font-mono text-xs leading-tight select-none"
      style={{
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <div style={{ marginBottom: '12px' }}>
        {TITLE_ART.map((line, i) => (
          <pre key={i} style={{ margin: 0, color: i <= 6 ? '#777766' : i >= 8 && i <= 10 ? '#aa0000' : '#444444', textAlign: 'center' }}>
            {line}
          </pre>
        ))}
      </div>

      <pre style={{ margin: 0, color: '#993333', textAlign: 'center', marginBottom: '8px' }}>
        {flame} 어둠 속으로 내려가라 {flame}
      </pre>

      <pre style={{ margin: 0, color: '#555555', textAlign: 'center', marginBottom: '4px' }}>
        ─── 죽음의 10개 층 ───
      </pre>
      <pre style={{ margin: 0, color: '#337733', textAlign: 'center', marginBottom: '12px' }}>
        살아 돌아온 자 없다
      </pre>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
        <div className="cursor-pointer" onClick={onStart}>
          <pre style={{ margin: 0, color: '#444444', textAlign: 'center' }}>
            ╔═══════════════════╗
          </pre>
          <pre style={{ margin: 0, color: startButtonColor, textAlign: 'center' }}>
            ║ ▶ 탭 또는 엔터  ║
          </pre>
          <pre style={{ margin: 0, color: '#444444', textAlign: 'center' }}>
            ╚═══════════════════╝
          </pre>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <pre style={{ margin: 0, color: '#555555' }}>
            [터치 패드] 이동
          </pre>
          <pre style={{ margin: 0, color: '#555555' }}>
            [가방 버튼] 인벤토리
          </pre>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <pre style={{ margin: 0, color: '#555555' }}>
            [상호작용] 사용/공격/하강
          </pre>
          <pre style={{ margin: 0, color: '#555555' }}>
            [원거리 버튼] 사격
          </pre>
        </div>
      </div>
    </div>
  )
}
