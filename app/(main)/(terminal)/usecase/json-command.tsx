import { type Command } from '../domain/command'

function tryParseJson (input: string): unknown {
  return JSON.parse(input)
}

function formatOutput (parsed: unknown, minify: boolean): string[] {
  if (minify) {
    const minified = JSON.stringify(parsed)
    return [
      '┌─ JSON Minify ─────────────────────────────────┐',
      ...wrapLines(minified, 48).map(l => `│ ${l.padEnd(48)} │`),
      '└──────────────────────────────────────────────────┘'
    ]
  }

  const formatted = JSON.stringify(parsed, null, 2)
  const lines = formatted.split('\n')
  const maxWidth = 48

  const output: string[] = []
  output.push('┌─ JSON Format ────────────────────────────────┐')

  for (const line of lines) {
    const wrapped = wrapLines(line, maxWidth)
    for (const w of wrapped) {
      output.push(`│ ${w.padEnd(maxWidth)} │`)
    }
  }

  output.push('└──────────────────────────────────────────────────┘')
  return output
}

function wrapLines (text: string, maxWidth: number): string[] {
  const lines: string[] = []
  let remaining = text
  while (remaining.length > maxWidth) {
    lines.push(remaining.slice(0, maxWidth))
    remaining = remaining.slice(maxWidth)
  }
  lines.push(remaining)
  return lines
}

function validateJson (input: string): string[] {
  const output: string[] = []
  output.push('┌─ JSON Validate ──────────────────────────────┐')
  try {
    const parsed = tryParseJson(input)
    const type = Array.isArray(parsed) ? 'Array' : typeof parsed
    const size = JSON.stringify(parsed).length
    output.push('│ Status: VALID                                    │')
    output.push(`│ Type:   ${type.padEnd(40)} │`)
    output.push(`│ Size:   ${(size + ' bytes').padEnd(40)} │`)

    if (typeof parsed === 'object' && parsed !== null) {
      const keys = Object.keys(parsed)
      output.push(`│ Keys:   ${(keys.length + '').padEnd(40)} │`)
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    output.push('│ Status: INVALID                                  │')
    output.push(`│ Error:  ${msg.slice(0, 40).padEnd(40)} │`)
  }
  output.push('└──────────────────────────────────────────────────┘')
  return output
}

export const jsonCommand: Command = {
  name: 'json',
  description: 'JSON 포맷터/검증/축소 도구',
  category: 'dev',
  usage: 'json [format|minify|validate] <json_string>',
  flags: [
    { name: 'minify', short: 'm', long: '--minify', description: 'JSON 축소' },
    { name: 'validate', short: 'v', long: '--validate', description: 'JSON 검증만' }
  ],
  execute: async (setContext, args, flags): Promise<void> => {
    if (args.length === 0) {
      setContext((prev) => ({
        ...prev,
        view: [
          ...prev.view,
          'Usage: json [command] <json_string>',
          '',
          'Commands:',
          '  format   JSON 포맷팅 (기본)',
          '  minify   JSON 축소 (한 줄로)',
          '  validate JSON 유효성 검증',
          '',
          'Flags:',
          '  -m, --minify    축소 모드',
          '  -v, --validate  검증 모드',
          '',
          'Examples:',
          '  json \'{"name":"jinia","age":30}\'',
          '  json -m \'{"name": "jinia", "age": 30}\'',
          '  json validate \'{"key": "value"}\''
        ]
      }))
      return
    }

    let mode: 'format' | 'minify' | 'validate' = 'format'
    let input = ''

    if (flags?.m === true || flags?.minify === true) {
      mode = 'minify'
      input = args.join(' ')
    } else if (flags?.v === true || flags?.validate === true) {
      mode = 'validate'
      input = args.join(' ')
    } else if (args[0] === 'minify' || args[0] === 'min') {
      mode = 'minify'
      input = args.slice(1).join(' ')
    } else if (args[0] === 'validate' || args[0] === 'val') {
      mode = 'validate'
      input = args.slice(1).join(' ')
    } else if (args[0] === 'format' || args[0] === 'fmt') {
      mode = 'format'
      input = args.slice(1).join(' ')
    } else {
      input = args.join(' ')
    }

    if (input.trim() === '') {
      setContext((prev) => ({
        ...prev,
        view: [...prev.view, 'Error: JSON 문자열이 필요합니다']
      }))
      return
    }

    if (mode === 'validate') {
      setContext((prev) => ({
        ...prev,
        view: [...prev.view, ...validateJson(input)]
      }))
      return
    }

    try {
      const parsed = tryParseJson(input)
      const output = formatOutput(parsed, mode === 'minify')

      setContext((prev) => ({
        ...prev,
        view: [...prev.view, ...output]
      }))
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      setContext((prev) => ({
        ...prev,
        view: [
          ...prev.view,
          `Error: 유효하지 않은 JSON - ${msg}`,
          '',
          'Tip: json validate <text> 로 상세 검증 가능'
        ]
      }))
    }
  }
}
