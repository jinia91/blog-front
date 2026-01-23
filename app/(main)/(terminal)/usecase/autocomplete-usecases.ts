import { useState } from 'react'
import { COMMAND_LIST } from '../domain/command'

export interface AutoCompleteResult {
  completed: string // The autocompleted text
  suggestions: string[] // Multiple matches to show
  tabIndex: number // Current cycle position
}

export function useAutoComplete (): {
  handleTab: (currentInput: string, tabCount: number) => AutoCompleteResult
  resetTabState: () => void
} {
  const [tabState, setTabState] = useState({
    lastInput: '',
    suggestions: [] as string[],
    tabIndex: 0
  })

  const resetTabState = (): void => {
    setTabState({ lastInput: '', suggestions: [], tabIndex: 0 })
  }

  const handleTab = (currentInput: string, tabCount: number): AutoCompleteResult => {
    const trimmedInput = currentInput.trim()

    // Check if input has changed since last tab
    const inputChanged = trimmedInput !== tabState.lastInput

    // Get all command names and aliases
    const allCommands: string[] = []
    COMMAND_LIST.forEach(cmd => {
      allCommands.push(cmd.name)
      if (cmd.aliases !== null && cmd.aliases !== undefined) {
        allCommands.push(...cmd.aliases)
      }
    })

    // Sort alphabetically and remove duplicates
    const uniqueCommands = Array.from(new Set(allCommands))
    const sortedCommands = uniqueCommands.sort()

    // Empty input: show all commands
    if (trimmedInput === '') {
      const newSuggestions = sortedCommands
      setTabState({
        lastInput: trimmedInput,
        suggestions: newSuggestions,
        tabIndex: 0
      })
      return {
        completed: '',
        suggestions: newSuggestions,
        tabIndex: 0
      }
    }

    // Find matches
    const matches = sortedCommands.filter(cmd =>
      cmd.startsWith(trimmedInput)
    )

    // No matches
    if (matches.length === 0) {
      resetTabState()
      return {
        completed: currentInput,
        suggestions: [],
        tabIndex: 0
      }
    }

    // Single match: auto-fill
    if (matches.length === 1) {
      resetTabState()
      return {
        completed: matches[0],
        suggestions: [],
        tabIndex: 0
      }
    }

    // Multiple matches: cycle through on repeated tab
    if (inputChanged) {
      // First tab on new input: show all matches, complete to first
      setTabState({
        lastInput: trimmedInput,
        suggestions: matches,
        tabIndex: 0
      })
      return {
        completed: matches[0],
        suggestions: matches,
        tabIndex: 0
      }
    } else {
      // Repeated tab: cycle to next
      const nextIndex = (tabState.tabIndex + 1) % matches.length
      setTabState({
        lastInput: trimmedInput,
        suggestions: matches,
        tabIndex: nextIndex
      })
      return {
        completed: matches[nextIndex],
        suggestions: matches,
        tabIndex: nextIndex
      }
    }
  }

  return {
    handleTab,
    resetTabState
  }
}
