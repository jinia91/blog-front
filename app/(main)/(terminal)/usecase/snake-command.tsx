import { type Command } from '../domain/command'
import { startSnakeGame } from './snake-game'

export const snakeCommand: Command = {
  name: 'snake',
  description: '뱀게임을 실행합니다',
  execute: async (setContext, args: string[]) => {
    await startSnakeGame(setContext)
  }
}
