import { atom } from 'jotai/index'
import type { TerminalContext } from '../domain/terminal-context'
import { logo, welcomeCommand } from './welcome-command'
import { clearCommand } from './clear-command'
import { helpCommand } from './help-command'
import { historyCommand } from './history-command'

export const terminalUsecases = atom<TerminalContext>({
  history: [],
  output: [logo]
})

export const COMMAND_LIST = [clearCommand, welcomeCommand, helpCommand, historyCommand]
