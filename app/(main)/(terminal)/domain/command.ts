import type { TerminalContext } from './terminal-context'

export interface Command {
  name: string
  description: string
  execute: (setContext: (args: (((prev: TerminalContext) => TerminalContext) | TerminalContext)) => void, strings: string[]) => Promise<void>
}

export const commandParser: {
  parseCommand: (commandLine: string) => [string, string[]]
} = {
  parseCommand (commandLine: string): [string, string[]] {
    const [command, ...args] = commandLine.split(' ')
    return [command, args]
  }
}
