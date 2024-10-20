import { type Command } from '../domain/command'

export const historyCommand: Command = {
  name: 'history',
  description: '히스토리 목록을 출력합니다',
  execute: (terminalContext, setContext, args) => {
    const historyOutput = terminalContext.history.map((command, index) => `${index + 1}. ${command}`).join('\n')
    setContext({
      history: terminalContext.history,
      output: terminalContext.output.concat(historyOutput)
    })
  }
}
