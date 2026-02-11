import { type Command } from '../domain/command'

interface IpInfo {
  ip: string
  city?: string
  region?: string
  country?: string
  loc?: string
  org?: string
  timezone?: string
}

export const ipCommand: Command = {
  name: 'ip',
  description: '공인 IP 주소 및 위치 정보 조회',
  category: 'util',
  usage: 'ip',
  execute: async (setContext): Promise<void> => {
    setContext((prev) => ({
      ...prev,
      view: [...prev.view, 'IP 정보를 조회하는 중...']
    }))

    try {
      const response = await fetch('https://ipinfo.io/json')
      if (!response.ok) {
        setContext((prev) => ({
          ...prev,
          view: [...prev.view.slice(0, -1), `Error: IP 정보를 가져올 수 없습니다 (HTTP ${response.status})`]
        }))
        return
      }

      const data: IpInfo = await response.json()

      const W = 48
      const output: string[] = []
      output.push('┌─ IP Information ─────────────────────────────┐')
      output.push(`│ ${''.padEnd(W)} │`)
      output.push(`│ ${'  IP Address'.padEnd(W)} │`)
      output.push(`│ ${'  ' + (data.ip ?? 'Unknown').padEnd(W - 2)} │`)
      output.push(`│ ${''.padEnd(W)} │`)
      output.push('├──────────────────────────────────────────────────┤')

      const fields: Array<[string, string | undefined]> = [
        ['City', data.city],
        ['Region', data.region],
        ['Country', data.country],
        ['Location', data.loc],
        ['ISP', data.org],
        ['Timezone', data.timezone]
      ]

      for (const [label, value] of fields) {
        if (value !== undefined && value !== '') {
          const line = `  ${label.padEnd(12)} ${value}`
          output.push(`│ ${line.padEnd(W)} │`)
        }
      }

      output.push(`│ ${''.padEnd(W)} │`)
      output.push('└──────────────────────────────────────────────────┘')

      setContext((prev) => ({
        ...prev,
        view: [...prev.view.slice(0, -1), ...output]
      }))
    } catch (error) {
      setContext((prev) => ({
        ...prev,
        view: [
          ...prev.view.slice(0, -1),
          `Error: ${error instanceof Error ? error.message : '네트워크 오류'}`
        ]
      }))
    }
  }
}
