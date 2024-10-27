import { type Command, COMMAND_LIST } from '../domain/command'

export const helpCommand: Command = {
  name: 'help',
  description: '사용 가능한 커맨드 목록과 설명을 불러옵니다',
  execute: async (setContext, args): Promise<void> => {
    const helpManual = '  사용가능한 명령어: \n' +
      COMMAND_LIST.map(command => `   - ${command.name}: ${command.description}`).join('\n')

    setContext((prev) => ({
      ...prev,
      view: prev.view.concat(helpManual)
    }))
  }
}
