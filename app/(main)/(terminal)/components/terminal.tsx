'use client'
import React, { useRef, useEffect } from 'react'
import { CommandLine } from './command-line/command-line'
import { useSession } from '../../../login/(usecase)/session-usecases'
import Viewport from './terminal-view-port/terminal-view-port'
import { useBootSequence, BootSequence } from '../usecase/boot-sequence'
import { loadHistory, loadTheme } from '../usecase/terminal-persistence'
import { useAtom } from 'jotai'
import { terminalAtom } from '../usecase/command-handle-usecases'

export default function Terminal (): React.ReactElement {
  const { session } = useSession()
  const username = session?.nickName ?? 'guest'
  const [context, setContext] = useAtom(terminalAtom)
  const bootSequence = useBootSequence()

  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  const handleFocusInput = (): void => {
    if (inputRef.current != null) {
      inputRef.current.focus()
    }
  }

  // Auto-scroll to bottom when view changes
  useEffect(() => {
    if (terminalRef.current != null) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [context.view])

  // Load persisted data on mount
  useEffect(() => {
    const savedHistory = loadHistory()
    const savedTheme = loadTheme()

    setContext(prev => ({
      ...prev,
      commandHistory: savedHistory,
      theme: savedTheme as 'green' | 'amber' | 'blue' | 'white'
    }))
  }, [setContext])

  // Get dynamic theme class
  const themeClass = `terminal-theme-${context.theme ?? 'green'}`

  // Show boot sequence if booting
  if (bootSequence.isBooting) {
    return (
      <div
        className={`terminal-container ${themeClass} terminal-scanlines rounded-lg shadow-lg mx-auto font-mono text-sm`}
        style={{ maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }}
      >
        <BootSequence progress={bootSequence.progress} />
      </div>
    )
  }

  return (
    <div
      ref={terminalRef}
      className={`terminal-container ${themeClass} terminal-scanlines rounded-lg shadow-lg mx-auto font-mono text-sm`}
      style={{ maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }}
    >
      <div className="p-4">
        <p className="text-xs text-gray-400">{username}님 jinia&apos;s Log에 오신걸 환영합니다! &apos;help&apos;를 입력하여 명령어 목록을
          확인하세요.</p>
      </div>
      <div className="p-4" onClick={handleFocusInput}>
        <Viewport username={username}/>
        <CommandLine username={username} inputRef={inputRef}/>
      </div>
    </div>
  )
}
