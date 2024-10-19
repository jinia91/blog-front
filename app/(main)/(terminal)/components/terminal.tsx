'use client'
import React from 'react'
import { TerminalInput } from './input/input'
import { useSession } from '../../../login/(usecase)/session-usecases'

const Terminal: React.FC = () => {
  const { session } = useSession()
  const username = session?.nickName ?? 'guest'

  return (
    <div className="mx-auto bg-gray-900 rounded-lg shadow-lg font-mono text-sm text-gray-200">
      <div className="p-4">
        <p className="text-green-400">
          <p className="text-xs text-gray-400">{username}님 jinia&apos;s Log에 오신걸 환영합니다! &apos;help&apos;를 입력하여 명령어 목록을
            확인하세요.</p>
        </p>
      </div>
      <TerminalInput username={username}/>
    </div>
  )
}

export default Terminal
