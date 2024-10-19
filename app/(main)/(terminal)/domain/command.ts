import type { TerminalContext } from './terminal-context'

export interface Command {
  name: string
  description: string
  execute: (terminalContext: TerminalContext, setContext: (args: (((prev: TerminalContext) => TerminalContext) | TerminalContext)) => void, strings: string[]) => void
}
