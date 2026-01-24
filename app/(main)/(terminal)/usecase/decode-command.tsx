import { type Command } from '../domain/command'

export const decodeCommand: Command = {
  name: 'decode',
  description: 'URL 인코딩된 문자열을 디코딩합니다',
  category: 'util',
  aliases: ['urldecode'],
  usage: 'decode <encoded-string>',
  execute: async (setContext, args): Promise<void> => {
    const input = args.join(' ')

    if (input === '') {
      setContext((prev) => ({
        ...prev,
        view: [...prev.view, '오류: 디코딩할 문자열을 입력하세요', '사용법: decode %ED%95%9C%EA%B8%80']
      }))
      return
    }

    try {
      const decoded = decodeURIComponent(input)
      setContext((prev) => ({
        ...prev,
        view: [...prev.view, `입력: ${input}`, `결과: ${decoded}`]
      }))
    } catch (e) {
      setContext((prev) => ({
        ...prev,
        view: [...prev.view, '오류: 디코딩 실패 - 올바른 URL 인코딩 형식이 아닙니다']
      }))
    }
  }
}
