import { type Command } from '../domain/command'

export const dateCommand: Command = {
  name: 'date',
  description: '현재 날짜와 시간을 출력합니다',
  category: 'util',
  execute: async (setContext, args): Promise<void> => {
    const now = new Date()
    const formatted = now.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      weekday: 'long'
    })

    setContext((prev) => ({
      ...prev,
      view: [...prev.view, formatted]
    }))
  }
}
