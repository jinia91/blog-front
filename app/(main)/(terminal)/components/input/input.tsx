'use client'
import React, { type KeyboardEvent, useRef, useState } from 'react'
import { clearCommand } from '../../usecase/clear-command'
import { useAtom } from 'jotai/index'
import { terminalContextAtom } from '../../usecase/terminal-context-atom'

interface TerminalInputProps {
  username: string
}

export const TerminalInput: React.FC<TerminalInputProps> = ({ username }) => {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const [context, setContext] = useAtom(terminalContextAtom)
  const COMMAND_LIST = [clearCommand]

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      const [command, args] = parseCommand(input)
      processCommand(command, args)
      setInput('')
    }
  }

  const parseCommand = (commandLine: string): [string, string[]] => {
    const [command, ...args] = commandLine.split(' ')
    return [command, args]
  }

  const processCommand = (commandLine: string, args: string[]): void => {
    if (commandLine.trim() === '') {
      setContext({
        history: context.history.concat(input),
        currentScreen: context.currentScreen.concat(username + '@jiniaslog:~#')
      })
      return
    }
    const command = COMMAND_LIST.find((c) => c.name === commandLine)
    if (command === null || command === undefined) {
      setContext({
        history: context.history.concat(input),
        currentScreen: context.currentScreen
          .concat(username + '@jiniaslog:~# ' + input)
          .concat('jsh: 커맨드를 찾을수 없습니다: ' + commandLine)
      })
    } else {
      setContext({
        history: context.history.concat(input),
        currentScreen: context.currentScreen.concat(username + '@jiniaslog:~# ' + input)
      })
      command.execute(context, setContext, args)
    }
  }

  const handleFocusInput = (): void => {
    if (inputRef.current != null) {
      inputRef.current.focus()
    }
  }

  return (
    <div className="p-4" onClick={handleFocusInput}>
      {context.currentScreen.map((line, index) => (
        <pre key={index} className="text-green-400 whitespace-pre-wrap">{line}</pre>
      ))}

      {/* 입력 필드 */}
      <div className="flex">
        <span className="text-green-400">{username}@jiniaslog:~#&nbsp;</span>
        <input
          type="text"
          ref={inputRef}
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
