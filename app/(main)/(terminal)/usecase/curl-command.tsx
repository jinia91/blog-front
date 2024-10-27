import type { Command } from '../domain/command'

export const curlCommand: Command = {
  name: 'curl',
  description: 'http 요청을 보냅니다',
  execute: async (setContext, args): Promise<void> => {
    const url = args[0]
    try {
      setContext((prev) => ({
        ...prev,
        processContext: '요청 중입니다...'
      }))

      const response = await fetch(url)
      const data = await response.text()
      setContext((prev) => ({
        ...prev,
        view: prev.view.concat(data)
      }))
    } catch (error) {
      setContext((prev) => ({
        ...prev,
        view: prev.view.concat('요청에 실패 했습니다. 다시 시도해주세요.')
      }))
    } finally {
      setContext((prev) => ({
        ...prev,
        processContext: null
      }))
    }
  }
}
