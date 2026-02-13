'use client'
import React from 'react'

interface AnsiSegment {
  text: string
  color: string | null
}

function ansiToColor (code: number): string | null {
  const map: Record<number, string | null> = {
    0: null,
    31: '#ff5555',
    32: '#55ff55',
    33: '#ffff55',
    34: '#5555ff',
    35: '#ff55ff',
    36: '#55ffff',
    37: '#bbbbbb',
    90: '#666666',
    91: '#ff6666',
    92: '#66ff66',
    93: '#ffff66',
    94: '#6666ff',
    95: '#ff66ff',
    96: '#66ffff',
    97: '#ffffff'
  }
  return map[code] ?? null
}

function parseAnsi (line: string): AnsiSegment[] {
  const segments: AnsiSegment[] = []
  // eslint-disable-next-line no-control-regex
  const regex = /\x1b\[([0-9;]*)m/g
  let lastIndex = 0
  let currentColor: string | null = null
  let match = regex.exec(line)
  while (match !== null) {
    if (match.index > lastIndex) {
      const text = line.slice(lastIndex, match.index)
      // eslint-disable-next-line no-control-regex
      const cleaned = text.replace(/[\u0000-\u001F\u007F]/g, '')
      segments.push({ text: cleaned, color: currentColor })
    }
    const codes = match[1].split(';').map(code => parseInt(code, 10)).filter(code => !Number.isNaN(code))
    for (const code of codes) {
      const nextColor = ansiToColor(code)
      if (nextColor !== null || code === 0) {
        currentColor = nextColor
      }
    }
    lastIndex = regex.lastIndex
    match = regex.exec(line)
  }
  if (lastIndex < line.length) {
    const tail = line.slice(lastIndex)
    // eslint-disable-next-line no-control-regex
    const cleaned = tail.replace(/[\u0000-\u001F\u007F]/g, '')
    segments.push({ text: cleaned, color: currentColor })
  }
  return segments
}

export function AnsiLine ({ line }: { line: string }): React.ReactElement {
  // eslint-disable-next-line no-control-regex
  if (!line.includes('\x1b[')) {
    return <span>{line}</span>
  }
  const segments = parseAnsi(line)
  return (
    <>
      {segments.map((seg, i) => (
        seg.color !== null
          ? <span key={i} style={{ color: seg.color }}>{seg.text}</span>
          : <span key={i}>{seg.text}</span>
      ))}
    </>
  )
}
