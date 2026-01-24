import { type Command } from '../domain/command'
import { startTetrisGame } from './tetris-game/tetris-game'

export const tetrisCommand: Command = {
  name: 'tetris',
  description: '테트리스 게임을 실행합니다',
  category: 'fun',
  execute: async (setContext, args: string[]) => {
    await startTetrisGame(setContext)
  }
}
