export interface TerminalContext {
  commandHistory: string[]
  view: string[]
  currentInput: string
  currentHistoryIndex: number | null
}
