import { type ItemRarity } from './types'

export const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[91m',
  green: '\x1b[92m',
  yellow: '\x1b[93m',
  blue: '\x1b[94m',
  magenta: '\x1b[95m',
  cyan: '\x1b[96m',
  white: '\x1b[97m',
  gray: '\x1b[90m',
  darkRed: '\x1b[31m',
  darkGreen: '\x1b[32m',
  darkYellow: '\x1b[33m',
  darkCyan: '\x1b[36m',
  darkMagenta: '\x1b[35m'
}

export function rarityColor (rarity: ItemRarity | undefined): string {
  if (rarity === undefined || rarity === 'common') return C.white
  if (rarity === 'uncommon') return C.green
  if (rarity === 'rare') return C.blue
  if (rarity === 'epic') return C.magenta
  if (rarity === 'legendary') return C.bold + C.yellow
  return C.white
}

export function stripAnsi (str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[\d+m/g, '')
}

export function sanitizeLogLine (str: string): string {
  // Allow only SGR ANSI escapes and strip other control chars to avoid broken mobile logs.
  // eslint-disable-next-line no-control-regex
  const noUnsafeEsc = str.replace(/\x1b(?!\[[0-9;]*m)/g, '')
  // eslint-disable-next-line no-control-regex
  return noUnsafeEsc.replace(/[\u0000-\u0008\u000B-\u001A\u001C-\u001F\u007F]/g, '')
}

function charWidth (ch: string): number {
  const code = ch.codePointAt(0)
  if (code === undefined) return 1
  if (
    (code >= 0x1100 && code <= 0x115F) ||
    (code >= 0x2E80 && code <= 0x303E) ||
    (code >= 0x3040 && code <= 0x33BF) ||
    (code >= 0x3400 && code <= 0x4DBF) ||
    (code >= 0x4E00 && code <= 0x9FFF) ||
    (code >= 0xAC00 && code <= 0xD7AF) ||
    (code >= 0xF900 && code <= 0xFAFF) ||
    (code >= 0xFE30 && code <= 0xFE4F) ||
    (code >= 0xFF01 && code <= 0xFF60) ||
    (code >= 0xFFE0 && code <= 0xFFE6) ||
    (code >= 0x20000 && code <= 0x2FA1F)
  ) {
    return 2
  }
  return 1
}

export function displayWidth (str: string): number {
  const stripped = stripAnsi(str)
  let w = 0
  for (const ch of stripped) {
    w += charWidth(ch)
  }
  return w
}

function sliceDisplay (str: string, maxWidth: number): string {
  let w = 0
  let result = ''
  let pos = 0
  while (pos < str.length) {
    if (str.charCodeAt(pos) === 0x1b && pos + 1 < str.length && str[pos + 1] === '[') {
      const mIdx = str.indexOf('m', pos + 2)
      if (mIdx !== -1) {
        result += str.slice(pos, mIdx + 1)
        pos = mIdx + 1
        continue
      }
    }
    const ch = str[pos]
    const cw = charWidth(ch)
    if (w + cw > maxWidth) break
    result += ch
    w += cw
    pos++
  }
  return result + C.reset
}

export function padEndDisplay (str: string, targetWidth: number): string {
  const w = displayWidth(str)
  if (w >= targetWidth) return sliceDisplay(str, targetWidth)
  return str + ' '.repeat(targetWidth - w)
}
