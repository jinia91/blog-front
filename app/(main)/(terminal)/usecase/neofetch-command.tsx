import { type Command } from '../domain/command'

export const neofetchCommand: Command = {
  name: 'neofetch',
  description: '시스템 정보를 출력합니다',
  category: 'fun',
  execute: async (setContext, args): Promise<void> => {
    const getBrowserInfo = (): string => {
      if (typeof window === 'undefined') return 'Unknown'
      const ua = window.navigator.userAgent
      if (ua.includes('Chrome')) return 'Chrome'
      if (ua.includes('Safari')) return 'Safari'
      if (ua.includes('Firefox')) return 'Firefox'
      if (ua.includes('Edge')) return 'Edge'
      return 'Unknown'
    }

    const getOS = (): string => {
      if (typeof window === 'undefined') return 'Unknown'
      const ua = window.navigator.userAgent
      if (ua.includes('Win')) return 'Windows'
      if (ua.includes('Mac')) return 'macOS'
      if (ua.includes('Linux')) return 'Linux'
      if (ua.includes('Android')) return 'Android'
      if (ua.includes('iOS')) return 'iOS'
      return 'Unknown'
    }

    const getScreenResolution = (): string => {
      if (typeof window === 'undefined') return 'Unknown'
      return `${window.screen.width}x${window.screen.height}`
    }

    const art = [
      '          ___        ',
      '         (.. |       ',
      '         (<> |       ',
      '        / __  \\      ',
      '       ( /  \\ /|     ',
      '      _/\\ __)/_)     ',
      '      \\/-____\\/      '
    ]

    const info = [
      `OS: ${getOS()}`,
      `Browser: ${getBrowserInfo()}`,
      `Resolution: ${getScreenResolution()}`,
      `Language: ${typeof window !== 'undefined' ? window.navigator.language : 'Unknown'}`,
      `Theme: ${typeof window !== 'undefined' ? localStorage.getItem('terminal-theme') ?? 'green' : 'green'}`,
      'User: Jinia',
      `Uptime: ${typeof window !== 'undefined' ? Math.floor(performance.now() / 1000) + 's' : 'Unknown'}`
    ]

    const lines: string[] = []
    const maxLines = Math.max(art.length, info.length)

    for (let i = 0; i < maxLines; i++) {
      const artLine = art[i] ?? '                     '
      const infoLine = info[i] ?? ''
      lines.push(`${artLine}  ${infoLine}`)
    }

    setContext((prev) => ({
      ...prev,
      view: [...prev.view, '', ...lines, '']
    }))
  }
}
