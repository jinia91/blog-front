import { type Command } from '../domain/command'

export const evalCommand: Command = {
  name: 'eval',
  description: '자바스크립트 코드를 실행합니다',
  execute: async (setContext, args): Promise<void> => {
    const code = args.join(' ')
    try {
      setContext((prev) => ({
        ...prev,
        processContext: '실행 중입니다...'
      }))

      // eslint-disable-next-line no-eval
      const result = eval(code)
      if (result === undefined || result === null) { /* empty */
      } else if (typeof result === 'object') {
        setContext((prev) => ({
          ...prev,
          view: prev.view.concat(JSON.stringify(result, null, 2))
        }))
      } else {
        setContext((prev) => ({
          ...prev,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          view: prev.view.concat(result.toString())
        }))
      }
    } catch (error) {
      setContext((prev) => ({
        ...prev,
        view: prev.view.concat('실행에 실패 했습니다. 다시 시도해주세요.')
      }))
    } finally {
      setContext((prev) => ({
        ...prev,
        processContext: null
      }))
    }
  }
}
