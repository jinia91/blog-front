'use client'
import React, { type KeyboardEvent, useState } from 'react'

interface TerminalInputProps {
  username: string
  validCommands: string[]
}

export const TerminalInput: React.FC<TerminalInputProps> = ({ username, validCommands }) => {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState<string[]>([])

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      processCommand(input)
      setInput('')
    }
  }
  const processCommand = (command: string) => {
    if (validCommands.includes(command)) {
      setOutput([...output, `${username}@jiniaslog:~# ${command}`, `명령어 [${command}] 실행됨.`])
    } else {
      setOutput([...output, `${username}@jiniaslog:~# ${command}`, `명령어 [${command}]를 찾을 수 없습니다.`])
    }
  }

  return (
    <div className="p-4">
      {output.map((line, index) => (
        <p key={index} className="text-green-400">{line}</p>
      ))}

      {/* 입력 필드 */}
      <div className="flex">
        <span className="text-green-400">{username}@jiniaslog:~#&nbsp;</span>
        <input
          type="text"
          className="bg-transparent focus:outline-none text-green-400 flex-1"
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
          }}
          onKeyDown={handleKeyPress}
          autoFocus
        />
      </div>
    </div>
  )
}
