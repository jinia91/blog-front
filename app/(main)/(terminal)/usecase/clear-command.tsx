import { type Command } from '../domain/command'

export const clearCommand: Command = {
  name: 'clear',
  description: 'Clear the terminal screen',
  execute: (terminalContext, setContext, args) => {
    setContext({
      history: terminalContext.history.concat(args.join(' ')),
      currentScreen: []
    })
  }
}
