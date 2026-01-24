import { type Command } from '../domain/command'

type Mode = 'encode' | 'decode' | 'auto'

function detectMode (input: string): 'encode' | 'decode' {
  // Base64 패턴: 영문자, 숫자, +, /, = (패딩)
  const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/
  if (base64Pattern.test(input) && input.length % 4 === 0) {
    return 'decode'
  }
  return 'encode'
}

function encodeBase64 (input: string): string {
  try {
    return btoa(unescape(encodeURIComponent(input)))
  } catch (e) {
    throw new Error('인코딩 실패: 유효하지 않은 입력입니다')
  }
}

function decodeBase64 (input: string): string {
  try {
    return decodeURIComponent(escape(atob(input)))
  } catch (e) {
    throw new Error('디코딩 실패: 유효하지 않은 Base64 문자열입니다')
  }
}

function renderBox (mode: string, input: string, output: string): string {
  const lines = [
    '┌─────────────────────────────────────────┐',
    '│  🔐 Base64 Encoder/Decoder              │',
    '├─────────────────────────────────────────┤',
    `│  Mode: ${mode.padEnd(33)} │`,
    `│  Input:  ${input.slice(0, 31).padEnd(31)} │`,
    `│  Output: ${output.slice(0, 31).padEnd(31)} │`
  ]

  // 긴 출력은 여러 줄로 나눔
  if (output.length > 31) {
    let remaining = output.slice(31)
    while (remaining.length > 0) {
      const chunk = remaining.slice(0, 39)
      lines.push(`│  ${chunk.padEnd(39)} │`)
      remaining = remaining.slice(39)
    }
  }

  lines.push('└─────────────────────────────────────────┘')
  return lines.join('\n')
}

export const base64Command: Command = {
  name: 'base64',
  description: 'Base64 인코딩/디코딩 도구',
  category: 'util',
  usage: 'base64 [encode|decode] <text>',
  execute: async (setContext, args): Promise<void> => {
    if (args.length === 0 || args[0] === '') {
      setContext((prev) => ({
        ...prev,
        view: [
          ...prev.view,
          'Usage: base64 [encode|decode] <text>',
          '',
          'Examples:',
          '  base64 encode hello',
          '  base64 decode aGVsbG8=',
          '  base64 aGVsbG8=  (auto-detect)'
        ]
      }))
      return
    }

    let mode: Mode = 'auto'
    let input = ''

    // 첫 번째 인자가 모드인지 확인
    if (args[0] === 'encode' || args[0] === 'decode') {
      mode = args[0]
      input = args.slice(1).join(' ')
    } else {
      input = args.join(' ')
    }

    if (input === '') {
      setContext((prev) => ({
        ...prev,
        view: [...prev.view, 'Error: 입력 텍스트가 필요합니다']
      }))
      return
    }

    try {
      let result = ''
      let actualMode = mode

      if (mode === 'auto') {
        actualMode = detectMode(input)
      }

      if (actualMode === 'encode') {
        result = encodeBase64(input)
      } else {
        result = decodeBase64(input)
      }

      const modeDisplay = actualMode === 'encode' ? 'Encode' : 'Decode'
      const box = renderBox(modeDisplay, input, result)

      setContext((prev) => ({
        ...prev,
        view: [...prev.view, box]
      }))
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error'
      setContext((prev) => ({
        ...prev,
        view: [...prev.view, `Error: ${errorMessage}`]
      }))
    }
  }
}
