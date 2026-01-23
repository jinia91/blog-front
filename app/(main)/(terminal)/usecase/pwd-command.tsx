import { type Command } from '../domain/command'

export const pwdCommand: Command = {
  name: 'pwd',
  description: '현재 작업 디렉토리를 출력합니다',
  category: 'navigation',
  execute: async (setContext, args): Promise<void> => {
    if (typeof window === 'undefined') {
      setContext((prev) => ({
        ...prev,
        view: [...prev.view, '/home']
      }))
      return
    }

    const path = window.location.pathname
    let currentDir = '/home'

    if (path.startsWith('/blog')) {
      currentDir = '/blog'
    } else if (path.startsWith('/memo')) {
      currentDir = '/memo'
    }

    setContext((prev) => ({
      ...prev,
      view: [...prev.view, currentDir]
    }))
  }
}
