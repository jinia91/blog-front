import { type Command } from '../domain/command'
import { COMMAND_LIST } from './terminal-atom'

export const helpCommand: Command = {
  name: 'help',
  description: '사용 가능한 커맨드 목록과 설명을 불러옵니다',
  execute: (terminalContext, setContext, args) => {
    const helpManual = '  사용가능한 명령어: \n' +
      COMMAND_LIST.map(command => `   - ${command.name}: ${command.description}`).join('\n')

    setContext({
      commandHistory: terminalContext.commandHistory,
      view: terminalContext.view.concat(helpManual)
    })
  }
}
