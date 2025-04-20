export interface TerminalContext {
  commandHistory: string[]
  view: string[]
  currentInput: string
  currentHistoryIndex: number | null
  processContext: any | null
  isInitialLoad: boolean
}

export const COMMAND_LINE_DEFAULT = ':~'
