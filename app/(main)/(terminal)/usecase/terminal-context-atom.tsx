import { atom } from 'jotai/index'
import type { TerminalContext } from '../domain/terminal-context'

export const terminalContextAtom = atom<TerminalContext>({
  history: [],
  currentScreen: []
})
