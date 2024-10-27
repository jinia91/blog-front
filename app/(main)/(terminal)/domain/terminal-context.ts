export interface TerminalContext {
  commandHistory: string[]
  view: string[]
  currentInput: string
  currentHistoryIndex: number | null
  isProcessing: boolean
}

export const COMMAND_LINE_DEFAULT = '@jiniaslog:# ~'
