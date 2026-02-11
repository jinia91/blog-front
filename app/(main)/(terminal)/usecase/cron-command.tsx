import { type Command } from '../domain/command'

interface CronParts {
  minute: string
  hour: string
  dayOfMonth: string
  month: string
  dayOfWeek: string
}

const MONTH_NAMES = ['', '1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

function parseCronExpression (expr: string): CronParts | null {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return null

  return {
    minute: parts[0],
    hour: parts[1],
    dayOfMonth: parts[2],
    month: parts[3],
    dayOfWeek: parts[4]
  }
}

function describeField (field: string, type: 'minute' | 'hour' | 'dayOfMonth' | 'month' | 'dayOfWeek'): string {
  if (field === '*') {
    return '매'
  }

  if (field.includes('/')) {
    const [, step] = field.split('/')
    const unitMap = { minute: '분', hour: '시간', dayOfMonth: '일', month: '개월', dayOfWeek: '요일' }
    return `${step}${unitMap[type]}마다`
  }

  if (field.includes('-')) {
    return formatRange(field, type)
  }

  if (field.includes(',')) {
    return formatList(field, type)
  }

  return formatSingle(field, type)
}

function formatRange (field: string, type: string): string {
  const [start, end] = field.split('-')
  if (type === 'dayOfWeek') {
    const startDay = DAY_NAMES[parseInt(start)] ?? start
    const endDay = DAY_NAMES[parseInt(end)] ?? end
    return `${startDay}~${endDay}요일`
  }
  if (type === 'month') {
    return `${start}월~${end}월`
  }
  return `${start}-${end}`
}

function formatList (field: string, type: string): string {
  const items = field.split(',')
  if (type === 'dayOfWeek') {
    return items.map(i => (DAY_NAMES[parseInt(i)] ?? i) + '요일').join(', ')
  }
  if (type === 'month') {
    return items.map(i => `${i}월`).join(', ')
  }
  return items.join(', ')
}

function formatSingle (field: string, type: string): string {
  if (type === 'dayOfWeek') {
    return (DAY_NAMES[parseInt(field)] ?? field) + '요일'
  }
  if (type === 'month') {
    return MONTH_NAMES[parseInt(field)] ?? `${field}월`
  }
  return field
}

function describeCron (parts: CronParts): string {
  const pieces: string[] = []

  // 월
  if (parts.month !== '*') {
    pieces.push(describeField(parts.month, 'month'))
  }

  // 요일
  if (parts.dayOfWeek !== '*') {
    const dayDesc = describeField(parts.dayOfWeek, 'dayOfWeek')
    pieces.push(dayDesc)
  }

  // 일
  if (parts.dayOfMonth !== '*') {
    if (parts.dayOfMonth.includes('/')) {
      pieces.push(describeField(parts.dayOfMonth, 'dayOfMonth'))
    } else {
      pieces.push(`${parts.dayOfMonth}일`)
    }
  }

  // 시간
  if (parts.hour !== '*') {
    if (parts.hour.includes('/')) {
      pieces.push(describeField(parts.hour, 'hour'))
    } else {
      const hourVal = parseInt(parts.hour)
      if (!isNaN(hourVal)) {
        const period = hourVal < 12 ? '오전' : '오후'
        const displayHour = hourVal === 0 ? 12 : hourVal > 12 ? hourVal - 12 : hourVal
        pieces.push(`${period} ${displayHour}시`)
      } else {
        pieces.push(describeField(parts.hour, 'hour'))
      }
    }
  } else {
    pieces.push('매시간')
  }

  // 분
  if (parts.minute !== '*') {
    if (parts.minute.includes('/')) {
      pieces.push(describeField(parts.minute, 'minute'))
    } else {
      pieces.push(`${parts.minute}분`)
    }
  } else if (parts.hour !== '*') {
    pieces.push('0분')
  }

  return pieces.join(' ') + '에 실행'
}

function getNextExecutions (parts: CronParts, count: number): string[] {
  const results: string[] = []
  const now = new Date()
  const current = new Date(now)

  for (let i = 0; i < 525600 && results.length < count; i++) {
    current.setMinutes(current.getMinutes() + 1)

    const min = current.getMinutes()
    const hour = current.getHours()
    const dom = current.getDate()
    const month = current.getMonth() + 1
    const dow = current.getDay()

    if (!matchField(parts.minute, min)) continue
    if (!matchField(parts.hour, hour)) continue
    if (!matchField(parts.dayOfMonth, dom)) continue
    if (!matchField(parts.month, month)) continue
    if (!matchField(parts.dayOfWeek, dow)) continue

    const dayName = DAY_NAMES[dow] ?? ''
    results.push(
      `${current.getFullYear()}-${pad2(month)}-${pad2(dom)} (${dayName}) ${pad2(hour)}:${pad2(min)}`
    )
  }

  return results
}

function matchField (field: string, value: number): boolean {
  if (field === '*') return true

  if (field.includes('/')) {
    const [base, stepStr] = field.split('/')
    const step = parseInt(stepStr)
    if (isNaN(step)) return false
    if (base === '*') return value % step === 0
    const start = parseInt(base)
    if (isNaN(start)) return false
    return value >= start && (value - start) % step === 0
  }

  if (field.includes(',')) {
    return field.split(',').some(v => parseInt(v) === value)
  }

  if (field.includes('-')) {
    const [start, end] = field.split('-')
    return value >= parseInt(start) && value <= parseInt(end)
  }

  return parseInt(field) === value
}

function pad2 (n: number): string {
  return n.toString().padStart(2, '0')
}

const PRESETS: Record<string, string> = {
  '@yearly': '0 0 1 1 *',
  '@annually': '0 0 1 1 *',
  '@monthly': '0 0 1 * *',
  '@weekly': '0 0 * * 0',
  '@daily': '0 0 * * *',
  '@midnight': '0 0 * * *',
  '@hourly': '0 * * * *'
}

export const cronCommand: Command = {
  name: 'cron',
  description: 'Cron 표현식 해석기',
  category: 'dev',
  usage: 'cron <expression>',
  execute: async (setContext, args): Promise<void> => {
    if (args.length === 0) {
      setContext((prev) => ({
        ...prev,
        view: [
          ...prev.view,
          'Usage: cron <expression>',
          '',
          'Examples:',
          '  cron "0 9 * * 1-5"     평일 오전 9시',
          '  cron "*/15 * * * *"    15분마다',
          '  cron "0 0 1 * *"       매월 1일 자정',
          '  cron "30 2 * * 0"      일요일 오전 2:30',
          '  cron @daily             매일 자정',
          '',
          'Format: minute hour day month weekday',
          '  minute:  0-59',
          '  hour:    0-23',
          '  day:     1-31',
          '  month:   1-12',
          '  weekday: 0-6 (0=일요일)',
          '',
          'Presets: @yearly @monthly @weekly @daily @hourly'
        ]
      }))
      return
    }

    let expression = args.join(' ')

    // 프리셋 처리
    if (expression.startsWith('@')) {
      const preset = PRESETS[expression]
      if (preset === undefined) {
        setContext((prev) => ({
          ...prev,
          view: [...prev.view, `Error: 알 수 없는 프리셋 '${expression}'`]
        }))
        return
      }
      expression = preset
    }

    const parts = parseCronExpression(expression)
    if (parts === null) {
      setContext((prev) => ({
        ...prev,
        view: [
          ...prev.view,
          'Error: 유효하지 않은 cron 표현식',
          'Format: <minute> <hour> <day> <month> <weekday>',
          'Example: cron "0 9 * * 1-5"'
        ]
      }))
      return
    }

    const description = describeCron(parts)
    const nextRuns = getNextExecutions(parts, 5)

    const W = 48
    const output: string[] = []
    output.push('┌─ Cron Expression ────────────────────────────┐')
    output.push(`│ ${expression.padEnd(W)} │`)
    output.push('├──────────────────────────────────────────────────┤')
    output.push(`│ ${description.padEnd(W)} │`)
    output.push('├──────────────────────────────────────────────────┤')
    output.push(`│ ${'Field     Value    Description'.padEnd(W)} │`)
    output.push(`│ ${'─'.repeat(W)} │`)
    output.push(`│ ${`minute    ${parts.minute.padEnd(9)}${describeField(parts.minute, 'minute')}`.padEnd(W)} │`)
    output.push(`│ ${`hour      ${parts.hour.padEnd(9)}${describeField(parts.hour, 'hour')}`.padEnd(W)} │`)
    output.push(`│ ${`day       ${parts.dayOfMonth.padEnd(9)}${describeField(parts.dayOfMonth, 'dayOfMonth')}`.padEnd(W)} │`)
    output.push(`│ ${`month     ${parts.month.padEnd(9)}${describeField(parts.month, 'month')}`.padEnd(W)} │`)
    output.push(`│ ${`weekday   ${parts.dayOfWeek.padEnd(9)}${describeField(parts.dayOfWeek, 'dayOfWeek')}`.padEnd(W)} │`)
    output.push('├──────────────────────────────────────────────────┤')
    output.push(`│ ${'Next 5 executions:'.padEnd(W)} │`)
    output.push(`│ ${'─'.repeat(W)} │`)

    for (const run of nextRuns) {
      output.push(`│ ${'  ' + run.padEnd(W - 2)} │`)
    }

    if (nextRuns.length === 0) {
      output.push(`│ ${'  (1년 내 실행 예정 없음)'.padEnd(W)} │`)
    }

    output.push('└──────────────────────────────────────────────────┘')

    setContext((prev) => ({
      ...prev,
      view: [...prev.view, ...output]
    }))
  }
}
