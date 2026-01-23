import { type Command } from '../domain/command'

export const matrixCommand: Command = {
  name: 'matrix',
  description: '매트릭스 효과를 재생합니다',
  category: 'fun',
  execute: async (setContext, args): Promise<void> => {
    const chars = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789'
    const width = 80
    const height = 20
    let frameCount = 0
    const maxFrames = 50

    setContext((prev) => ({
      ...prev,
      view: [...prev.view, 'Matrix 모드 시작... (5초간 실행)'],
      processContext: 'matrix'
    }))

    const intervalId = setInterval(() => {
      const lines: string[] = []
      for (let i = 0; i < height; i++) {
        let line = ''
        for (let j = 0; j < width; j++) {
          if (Math.random() > 0.95) {
            line += chars[Math.floor(Math.random() * chars.length)]
          } else {
            line += ' '
          }
        }
        lines.push(line)
      }

      setContext(prev => {
        frameCount++
        if (frameCount >= maxFrames) {
          clearInterval(intervalId)
          return {
            ...prev,
            view: [...prev.view.slice(0, -height - 1), '', 'Matrix 모드 종료'],
            processContext: null
          }
        }
        return {
          ...prev,
          view: [...prev.view.slice(0, -height), ...lines]
        }
      })
    }, 100)
  }
}
