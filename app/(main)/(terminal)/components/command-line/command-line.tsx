'use client'
import React, { type KeyboardEvent, useEffect, useRef, useState } from 'react'
import { useCommandNavigate } from '../../usecase/command-navigator-usecases'
import { terminalAtom, useCommandHandle } from '../../usecase/command-handle-usecases'
import { useAtom } from 'jotai'
import { useAutoComplete } from '../../usecase/autocomplete-usecases'

interface TerminalInputProps {
  username: string
  inputRef: React.RefObject<HTMLInputElement>
}

export const CommandLine: React.FC<TerminalInputProps> = ({ username, inputRef }) => {
  const { navigate } = useCommandNavigate()
  const { handleCommand } = useCommandHandle()
  const [context, setContext] = useAtom(terminalAtom)
  const { handleTab, resetTabState } = useAutoComplete()
  const [suggestions, setSuggestions] = useState<string[]>([])
  const tabCountRef = useRef(0)

  const handleKeyPress = async (e: KeyboardEvent<HTMLInputElement>): Promise<void> => {
    if (e.key === 'Enter') {
      resetTabState()
      tabCountRef.current = 0
      setSuggestions([])
      await handleCommand(username)
    } else if (e.key === 'Tab') {
      e.preventDefault()
      tabCountRef.current += 1
      const result = handleTab(context.currentInput, tabCountRef.current)

      setContext((prevContext) => ({
        ...prevContext,
        currentInput: result.completed
      }))

      setSuggestions(result.suggestions)
    } else if (e.key === 'ArrowUp') {
      navigate('up')
      resetTabState()
      tabCountRef.current = 0
      setSuggestions([])
    } else if (e.key === 'ArrowDown') {
      navigate('down')
      resetTabState()
      tabCountRef.current = 0
      setSuggestions([])
    } else {
      // Any other key resets tab state
      resetTabState()
      tabCountRef.current = 0
      setSuggestions([])
    }
  }

  useEffect(() => {
    if (!context.isInitialLoad) {
      setContext((prevContext) => ({
        ...prevContext,
        currentInput: 'whoami'
      }))
    }
  }, [])

  useEffect(() => {
    if (context.currentInput === 'whoami' && !context.isInitialLoad) {
      setContext((prevContext) => ({
        ...prevContext,
        isInitialLoad: true
      }))
      handleCommand(username).catch(console.error)
    }
  }, [context.currentInput])

  return context.processContext !== null
    ? null
    : (
      <>
        <div className="flex items-center">
          <span className="text-blue-400">{username}</span>
          <span className="text-green-400">:~&nbsp;</span>
          <input
            type="text"
            ref={inputRef}
            className="bg-transparent focus:outline-none text-green-400 flex-1 caret-green-400"
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
        {suggestions.length > 0 && (
          <div className="text-gray-400 text-sm mt-1 pl-4">
            {suggestions.join('  ')}
          </div>
        )}
      </>
      )
}
