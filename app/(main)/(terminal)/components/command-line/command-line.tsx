'use client'
import React, { type KeyboardEvent, useEffect } from 'react'
import { useCommandNavigate } from '../../usecase/command-navigator-usecases'
import { terminalAtom, useCommandHandle } from '../../usecase/command-handle-usecases'
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
      await handleCommand(username)
    } else if (e.key === 'ArrowUp') {
      navigate('up')
    } else if (e.key === 'ArrowDown') {
      navigate('down')
    }
  }

  useEffect(() => {
    if (context.processContext === null && !context.isInitialLoad) {
      setContext((prevContext) => ({
        ...prevContext,
        currentInput: 'whoami',
        isInitialLoad: true
      }))
    }
    // 강제로 일정시간 지연
    setTimeout(() => {
      handleCommand(username).catch(console.log)
    }, 100)
  }, [context.processContext, context.isInitialLoad])

  return context.processContext !== null
    ? null
    : (
      <div className="flex">
        <span className="text-blue-400">{username}</span>
        <span className="text-green-400">:~&nbsp;</span>
        <input
          type="text"
          ref={inputRef}
          className="bg-transparent focus:outline-none text-green-400 flex-1"
          value={context.currentInput}
          onChange={(e) => {
            setContext((prevContext: any) => ({
              ...prevContext,
              currentInput: e.target.value
            }))
          }}
          onKeyDown={e => {
            handleKeyPress(e).catch(console.debug)
          }}
          autoFocus
        />
      </div>
      )
}
