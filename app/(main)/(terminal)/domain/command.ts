import type { TerminalContext } from './terminal-context'
import { clearCommand } from '../usecase/clear-command'
import { welcomeCommand } from '../usecase/welcome-command'
import { helpCommand } from '../usecase/help-command'
import { historyCommand } from '../usecase/history-command'
import { githubCommand } from '../usecase/github-command'
import { snakeCommand } from '../usecase/snake-command'
import { tetrisCommand } from '../usecase/tetris-command'
import { whoAmICommand } from '../usecase/whoami-command'
import { lsCommand } from '../usecase/ls-command'
import { cdCommand } from '../usecase/cd-command'
import { catCommand } from '../usecase/cat-command'
import { dateCommand } from '../usecase/date-command'
import { echoCommand } from '../usecase/echo-command'
import { neofetchCommand } from '../usecase/neofetch-command'
import { matrixCommand } from '../usecase/matrix-command'
import { weatherCommand } from '../usecase/weather-command'
import { decodeCommand } from '../usecase/decode-command'
import { base64Command } from '../usecase/base64-command'
import { timestampCommand } from '../usecase/timestamp-command'

export type SetContextFn = (args: (((prev: TerminalContext) => TerminalContext) | TerminalContext)) => void

export interface CommandFlag {
  name: string
  short?: string // -h
  long?: string // --help
  description: string
  hasValue?: boolean
}

export type ParsedFlags = Record<string, string | boolean>

export type CommandCategory = 'system' | 'navigation' | 'util' | 'fun' | 'dev'

export interface Command {
  name: string
  description: string
  category: CommandCategory
  aliases?: string[]
  flags?: CommandFlag[]
  usage?: string // e.g., "curl [options] <url>"
  execute: (setContext: SetContextFn, args: string[], flags?: ParsedFlags) => Promise<void>
}

export const COMMAND_CATEGORIES = {
  system: { name: 'System', description: '시스템 명령어' },
  navigation: { name: 'Navigation', description: '탐색 명령어' },
  util: { name: 'Utilities', description: '유틸리티' },
  fun: { name: 'Fun', description: '재미있는 명령어' },
  dev: { name: 'Developer', description: '개발자 도구' }
} as const

export const COMMAND_LIST = [
  clearCommand,
  welcomeCommand,
  helpCommand,
  historyCommand,
  githubCommand,
  snakeCommand,
  tetrisCommand,
  whoAmICommand,
  lsCommand,
  cdCommand,
  catCommand,
  dateCommand,
  echoCommand,
  neofetchCommand,
  matrixCommand,
  weatherCommand,
  decodeCommand,
  base64Command,
  timestampCommand
]

export interface ParseResult {
  command: string
  args: string[]
  flags: ParsedFlags
}

export const commandParser: {
  parseCommand: (commandLine: string) => ParseResult
} = {
  parseCommand (commandLine: string): ParseResult {
    const tokens = commandLine.trim().split(/\s+/)
    const command = tokens[0] ?? ''
    const args: string[] = []
    const flags: ParsedFlags = {}

    let i = 1
    while (i < tokens.length) {
      const token = tokens[i]

      if (token !== undefined && token.startsWith('--')) {
        // Long flag: --flag or --flag=value
        const flagPart = token.slice(2)
        const eqIndex = flagPart.indexOf('=')

        if (eqIndex !== -1) {
          // --flag=value
          const flagName = flagPart.slice(0, eqIndex)
          const flagValue = flagPart.slice(eqIndex + 1)
          flags[flagName] = flagValue
        } else {
          // --flag (check if next token is value)
          const flagName = flagPart
          const nextToken = tokens[i + 1]
          if (i + 1 < tokens.length && nextToken !== undefined && !nextToken.startsWith('-')) {
            flags[flagName] = nextToken
            i++
          } else {
            flags[flagName] = true
          }
        }
      } else if (token !== undefined && token.startsWith('-') && token.length > 1) {
        // Short flag: -f or -f value
        const flagChars = token.slice(1)

        // Multiple short flags: -abc -> -a -b -c
        if (flagChars.length > 1 && flagChars.match(/^\d/) === null) {
          for (const char of flagChars) {
            flags[char] = true
          }
        } else {
          // Single short flag: -f
          const flagName = flagChars
          const nextToken = tokens[i + 1]
          if (i + 1 < tokens.length && nextToken !== undefined && !nextToken.startsWith('-')) {
            flags[flagName] = nextToken
            i++
          } else {
            flags[flagName] = true
          }
        }
      } else {
        // Regular argument
        args.push(token)
      }

      i++
    }

    return { command, args, flags }
  }
}
