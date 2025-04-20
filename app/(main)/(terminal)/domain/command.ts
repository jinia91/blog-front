import type { TerminalContext } from './terminal-context'
import { clearCommand } from '../usecase/clear-command'
import { welcomeCommand } from '../usecase/welcome-command'
import { helpCommand } from '../usecase/help-command'
import { historyCommand } from '../usecase/history-command'
import { githubCommand } from '../usecase/github-command'
import { curlCommand } from '../usecase/curl-command'
import { snakeCommand } from '../usecase/snake-command'
import { evalCommand } from '../usecase/eval-command'
import { whoAmICommand } from '../usecase/whoami-command'

export interface Command {
  name: string
  description: string
  execute: (setContext: (args: (((prev: TerminalContext) => TerminalContext) | TerminalContext)) => void, strings: string[]) => Promise<void>
}

export const COMMAND_LIST = [clearCommand, welcomeCommand, helpCommand, historyCommand, githubCommand, curlCommand, snakeCommand, evalCommand, whoAmICommand]

export const commandParser: {
  parseCommand: (commandLine: string) => [string, string[]]
} = {
  parseCommand (commandLine: string): [string, string[]] {
    const [command, ...args] = commandLine.split(' ')
    return [command, args]
  }
}
