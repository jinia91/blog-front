export interface TerminalContext {
  commandHistory: string[]
  view: string[]
  currentInput: string
  currentHistoryIndex: number | null
  processContext: any | null
  isInitialLoad: boolean
  theme: 'green' | 'amber' | 'blue' | 'white'
  isBooting: boolean
}

export const COMMAND_LINE_DEFAULT = ':~'
