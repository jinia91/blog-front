import { type Command } from '../domain/command'

export const historyCommand: Command = {
  name: 'history',
  description: '히스토리 목록을 출력합니다',
  execute: (setContext, args) => {
    setContext((prev) => ({
      ...prev,
      view: prev.view.concat(prev.commandHistory.map((command, index) => `${index + 1}. ${command}`).join('\n'))
    }))
  }
}
