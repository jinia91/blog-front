import { type Command } from '../domain/command'

export const timestampCommand: Command = {
  name: 'timestamp',
  description: 'Unix timestamp와 날짜를 상호 변환합니다',
  category: 'util',
  usage: 'timestamp [timestamp|date]',
  execute: async (setContext, args): Promise<void> => {
    let output = ''

    if (args.length === 0) {
      // 현재 시간의 Unix timestamp
      const now = new Date()
      const unixTimestamp = Math.floor(now.getTime() / 1000)
      const iso = now.toISOString()
      const kst = now.toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Seoul'
      })

      output = [
        '┌─────────────────────────────────────────┐',
        '│  🕐 Timestamp 변환                      │',
        '├─────────────────────────────────────────┤',
        `│  Unix: ${unixTimestamp.toString().padEnd(31)} │`,
        `│  ISO:  ${iso.padEnd(31)} │`,
        `│  KST:  ${kst.padEnd(31)} │`,
        '└─────────────────────────────────────────┘'
      ].join('\n')
    } else {
      const input = args[0]

      if (input === undefined || input === '') {
        output = 'Error: Invalid input'
      } else {
        // timestamp 숫자인지 확인
        const timestampMatch = /^\d+$/.test(input)

        if (timestampMatch) {
          // Unix timestamp -> 날짜 변환
          const timestamp = parseInt(input, 10)
          const date = new Date(timestamp * 1000)

          if (isNaN(date.getTime())) {
            output = 'Error: Invalid timestamp'
          } else {
            const iso = date.toISOString()
            const kst = date.toLocaleString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'short',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              timeZone: 'Asia/Seoul'
            })

            output = [
              '┌─────────────────────────────────────────┐',
              '│  🕐 Timestamp 변환                      │',
              '├─────────────────────────────────────────┤',
              `│  Unix: ${input.padEnd(31)} │`,
              `│  ISO:  ${iso.padEnd(31)} │`,
              `│  KST:  ${kst.padEnd(31)} │`,
              '└─────────────────────────────────────────┘'
            ].join('\n')
          }
        } else {
          // 날짜 문자열 -> Unix timestamp 변환
          const date = new Date(input)

          if (isNaN(date.getTime())) {
            output = 'Error: Invalid date format'
          } else {
            const unixTimestamp = Math.floor(date.getTime() / 1000)
            const iso = date.toISOString()
            const kst = date.toLocaleString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'short',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              timeZone: 'Asia/Seoul'
            })

            output = [
              '┌─────────────────────────────────────────┐',
              '│  🕐 Timestamp 변환                      │',
              '├─────────────────────────────────────────┤',
              `│  Unix: ${unixTimestamp.toString().padEnd(31)} │`,
              `│  ISO:  ${iso.padEnd(31)} │`,
              `│  KST:  ${kst.padEnd(31)} │`,
              '└─────────────────────────────────────────┘'
            ].join('\n')
          }
        }
      }
    }

    setContext((prev) => ({
      ...prev,
      view: [...prev.view, output]
    }))
  }
}
