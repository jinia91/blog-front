'use client'
import React, { type KeyboardEvent, useRef, useState } from 'react'
import { useAtom } from 'jotai/index'
import { COMMAND_LIST, terminalUsecases } from '../../usecase/terminal-usecases'
import { type TerminalContext } from '../../domain/terminal-context'

interface TerminalInputProps {
  username: string
}

export const TerminalInput: React.FC<TerminalInputProps> = ({ username }) => {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const [historyIndex, setHistoryIndex] = useState<number | null>(null)
  const [context, setContext] = useAtom(terminalUsecases)

  const handleKeyPress = async (e: KeyboardEvent<HTMLInputElement>): Promise<void> => {
    if (e.key === 'Enter') {
      const [command, args] = parseCommand(input)
      const postContext = await preProcessCommand(command, args)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      processCommand(postContext, command, args)
      setInput('')
    } else if (e.key === 'ArrowUp') {
      navigateHistory('up')
    } else if (e.key === 'ArrowDown') {
      navigateHistory('down')
    }
  }

  const parseCommand = (commandLine: string): [string, string[]] => {
    const [command, ...args] = commandLine.split(' ')
    return [command, args]
  }

  const preProcessCommand = async (commandLine: string, args: string[]): Promise<typeof context> => {
    return await new Promise((resolve) => {
      setContext((prevContext) => {
        setHistoryIndex(null)
        const updatedContext = {
          ...prevContext,
          history: prevContext.history.concat(commandLine.trim() === '' ? prevContext.history : commandLine),
          output: prevContext.output.concat(username + '@jiniaslog:# ~ ' + commandLine)
        }
        resolve(updatedContext)
        return updatedContext
      })
    })
  }

  const processCommand = (preProcessedContext: TerminalContext, commandLine: string, args: string[]): void => {
    if (commandLine.trim() === '') {
      return
    }
    const command = COMMAND_LIST.find((c) => c.name === commandLine)
    if (command === null || command === undefined) {
      setContext((preProcessedContext) => ({
        ...preProcessedContext,
        output: preProcessedContext.output.concat(
          'jsh: 커맨드를 찾을수 없습니다: ' + commandLine
        )
      }))
    } else {
      command.execute(preProcessedContext, setContext, args)
    }
  }

  const handleFocusInput = (): void => {
    if (inputRef.current != null) {
      inputRef.current.focus()
    }
  }

  const navigateHistory = (direction: 'up' | 'down'): void => {
    const historyLength = context.history.length
    if (historyLength === 0) return

    if (direction === 'up') {
      if (historyIndex === null) {
        setHistoryIndex(historyLength - 1)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        setInput(context.history[historyLength - 1])
      } else if (historyIndex > 0) {
        setHistoryIndex(historyIndex - 1)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        setInput(context.history[historyIndex - 1])
      }
    } else if (direction === 'down') {
      if (historyIndex !== null && historyIndex < historyLength - 1) {
        setHistoryIndex(historyIndex + 1)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        setInput(context.history[historyIndex + 1])
      } else {
        setHistoryIndex(null)
        setInput('')
      }
    }
  }

  return (
    <div className="p-4" onClick={handleFocusInput}>
      {context.output.map((line, index) => {
        const isUsernameLine = line.startsWith(username + '@jiniaslog:# ~')
        return (
          <pre key={index} className="whitespace-pre-wrap">
          {isUsernameLine
            ? (
              <>
                <span className="text-blue-400">{username}</span>
                <span className="text-green-400">{line.replace(username + '@jiniaslog:# ~', '@jiniaslog:# ~')}</span>
              </>
              )
            : (<span className="text-green-400">{line}</span>)}
        </pre>
        )
      })}
      <div className="flex">
        <span className="text-blue-400">{username}</span>
        <span className="text-green-400">@jiniaslog:# ~&nbsp;</span>
        <input
          type="text"
          ref={inputRef}
          className="bg-transparent focus:outline-none text-green-400 flex-1"
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
          }}
          onKeyDown={e => {
            handleKeyPress(e).catch(console.error)
          }}
          autoFocus
        />
      </div>
    </div>
  )
}
