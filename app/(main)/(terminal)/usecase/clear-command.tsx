import { type Command } from '../domain/command'

export const clearCommand: Command = {
  name: 'clear',
  description: '터미널 화면을 지웁니다',
  category: 'system',
  execute: async (setContext, args): Promise<void> => {
    setContext((prev) => ({
      ...prev,
      view: []
    }))
  }
}
