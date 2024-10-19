import { atom } from 'jotai/index'
import type { TerminalContext } from '../domain/terminal-context'
import { logo } from './welcome-command'

export const terminalContextAtom = atom<TerminalContext>({
  history: [],
  output: [logo]
})
