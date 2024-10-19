import React from 'react'
import { TerminalInput } from './input/input'

const Terminal: React.FC = () => {
  const username = 'guest'
  const validCommands = ['help', 'ls', 'echo', 'clear']

  return (
    <div className="mx-auto bg-gray-900 rounded-lg shadow-lg font-mono text-sm text-gray-200">
      <div className="p-4">
        <p className="text-green-400">
          <p className="text-xs text-gray-400">{username}님 jinia's Log에 오신걸 환영합니다</p>
        </p>
      </div>
      <TerminalInput username={username} validCommands={validCommands}/>
    </div>
  )
}

export default Terminal
