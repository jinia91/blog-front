import { type Command } from '../domain/command'

export const echoCommand: Command = {
  name: 'echo',
  description: '텍스트를 출력합니다',
  category: 'util',
  usage: 'echo <text>',
  execute: async (setContext, args): Promise<void> => {
    const text = args.join(' ')

    if (text === undefined || text === '') {
      setContext((prev) => ({
        ...prev,
        view: [...prev.view, '']
      }))
      return
    }

    setContext((prev) => ({
      ...prev,
      view: [...prev.view, text]
    }))
  }
}
