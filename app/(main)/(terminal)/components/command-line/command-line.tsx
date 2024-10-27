'use client'
import React, { type KeyboardEvent } from 'react'
import { useCommandNavigate } from '../../usecase/command-navigator-usecases'
import { useCommandHandle } from '../../usecase/command-handle-usecases'
import { terminalAtom } from '../../usecase/terminal-atom'
import { useAtom } from 'jotai'

interface TerminalInputProps {
  username: string
  inputRef: React.RefObject<HTMLInputElement>
}

export const CommandLine: React.FC<TerminalInputProps> = ({ username, inputRef }) => {
  const { navigate } = useCommandNavigate()
  const { handleCommand } = useCommandHandle()
  const [context, setContext] = useAtom(terminalAtom)

  const handleKeyPress = async (e: KeyboardEvent<HTMLInputElement>): Promise<void> => {
    if (e.key === 'Enter') {
      handleCommand(username)
    } else if (e.key === 'ArrowUp') {
      navigate('up')
    } else if (e.key === 'ArrowDown') {
      navigate('down')
    }
  }

  return (
    <div className="flex">
      <span className="text-blue-400">{username}</span>
      <span className="text-green-400">@jiniaslog:# ~&nbsp;</span>
      <input
        type="text"
        ref={inputRef}
        className="bg-transparent focus:outline-none text-green-400 flex-1"
        value={context.currentInput}
        onChange={(e) => {
          setContext((prevContext) => ({
            ...prevContext,
            currentInput: e.target.value
          }))
        }}
        onKeyDown={e => {
          handleKeyPress(e).catch(console.error)
        }}
        autoFocus
      />
    </div>
  )
}
