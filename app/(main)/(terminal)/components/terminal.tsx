'use client'
import React, { useRef } from 'react'
import { CommandLine } from './command-line/command-line'
import { useSession } from '../../../login/(usecase)/session-usecases'
import Viewport from './terminal-view-port/terminal-view-port'

export default function Terminal (): React.ReactElement {
  const { session } = useSession()
  const username = session?.nickName ?? 'guest'

  const inputRef = useRef<HTMLInputElement>(null)
  const handleFocusInput = (): void => {
    if (inputRef.current != null) {
      inputRef.current.focus()
    }
  }

  return (
    <div className="mx-auto bg-gray-900 rounded-lg shadow-lg font-mono text-sm text-gray-200">
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
