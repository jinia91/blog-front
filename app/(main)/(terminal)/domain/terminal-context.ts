export interface TerminalContext {
  commandHistory: string[]
  view: string[]
  currentInput: string
  currentHistoryIndex: number | null
}

export const COMMAND_LINE_DEFAULT = '@jiniaslog:# ~'
