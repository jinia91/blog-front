import { type Command } from '../domain/command'

export const clearCommand: Command = {
  name: 'clear',
  description: '터미널 화면을 지웁니다',
  execute: (terminalContext, setContext, args) => {
    setContext({
      history: terminalContext.history,
      output: []
    })
  }
}
