import { type Command } from '../domain/command'

export const historyCommand: Command = {
  name: 'history',
  description: '히스토리 목록을 출력합니다',
  execute: (terminalContext, setContext, args) => {
    const historyOutput = terminalContext.commandHistory.map((command, index) => `${index + 1}. ${command}`).join('\n')
    setContext({
      commandHistory: terminalContext.commandHistory,
      view: terminalContext.view.concat(historyOutput)
    })
  }
}
