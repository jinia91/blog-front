import { atom } from 'jotai/index'
import type { TerminalContext } from '../domain/terminal-context'
import { logo, welcomeCommand } from './welcome-command'
import { clearCommand } from './clear-command'
import { helpCommand } from './help-command'
import { historyCommand } from './history-command'
import { githubCommand } from './github-command'

export const terminalAtom = atom<TerminalContext>({
  commandHistory: [],
  view: [logo],
  currentInput: '',
  currentHistoryIndex: null
})

export const COMMAND_LIST = [clearCommand, welcomeCommand, helpCommand, historyCommand, githubCommand]
