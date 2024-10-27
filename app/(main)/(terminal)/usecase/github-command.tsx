import type { Command } from '../domain/command'

export const githubCommand: Command = {
  name: 'github',
  description: '깃허브 주소로 이동합니다',
  execute: async (setContext, args): Promise<void> => {
    setContext((prev) => ({
      ...prev,
      view: prev.view.concat('제 깃허브에 방문해주셔서 감사합니다! 🙇‍♂️')
    }))
    window.open('https://github.com/jinia91', '_blank')
  }
}
