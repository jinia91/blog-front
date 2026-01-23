import type { Command } from './command'

/**
 * Resolves command aliases to actual command names
 * @param commandName - The input command name or alias
 * @param aliases - Map of alias to command name
 * @returns The resolved command name
 */
export function resolveAlias (commandName: string, aliases: Map<string, string>): string {
  return aliases.get(commandName) ?? commandName
}

/**
 * Builds an alias map from command list
 * @param commands - Array of commands
 * @returns Map of alias to command name
 */
export function buildAliasMap (commands: Command[]): Map<string, string> {
  const aliasMap = new Map<string, string>()

  for (const command of commands) {
    if (command.aliases !== undefined) {
      for (const alias of command.aliases) {
        aliasMap.set(alias, command.name)
      }
    }
  }

  return aliasMap
}

/**
 * Calculates Levenshtein distance between two strings
 * @param a - First string
 * @param b - Second string
 * @returns Distance between strings
 */
function levenshteinDistance (a: string, b: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

/**
 * Suggests similar commands based on input
 * Uses Levenshtein distance and prefix matching
 * @param input - The input command that wasn't found
 * @param commands - Array of available commands
 * @param maxSuggestions - Maximum number of suggestions to return
 * @returns Array of suggested command names
 */
export function suggestCommand (
  input: string,
  commands: Command[],
  maxSuggestions: number = 3
): string[] {
  if (input === '' || commands.length === 0) {
    return []
  }

  const inputLower = input.toLowerCase()

  // Calculate scores for each command
  const scored = commands.map(command => {
    const commandLower = command.name.toLowerCase()

    // Exact prefix match gets highest priority
    if (commandLower.startsWith(inputLower)) {
      return { name: command.name, score: 0 }
    }

    // Check aliases too
    if (command.aliases !== undefined) {
      for (const alias of command.aliases) {
        if (alias.toLowerCase().startsWith(inputLower)) {
          return { name: command.name, score: 0 }
        }
      }
    }

    // Use Levenshtein distance
    const distance = levenshteinDistance(inputLower, commandLower)

    // Also check aliases
    let minAliasDistance = Infinity
    if (command.aliases !== undefined) {
      for (const alias of command.aliases) {
        const aliasDistance = levenshteinDistance(inputLower, alias.toLowerCase())
        minAliasDistance = Math.min(minAliasDistance, aliasDistance)
      }
    }

    return {
      name: command.name,
      score: Math.min(distance, minAliasDistance)
    }
  })

  // Filter by reasonable distance threshold
  const maxDistance = Math.max(2, Math.floor(input.length / 2))
  const filtered = scored.filter(item => item.score <= maxDistance)

  // Sort by score and return top suggestions
  return filtered
    .sort((a, b) => a.score - b.score)
    .slice(0, maxSuggestions)
    .map(item => item.name)
}

/**
 * Groups commands by category
 * @param commands - Array of commands
 * @returns Map of category to commands
 */
export function groupCommandsByCategory (commands: Command[]): Map<string, Command[]> {
  const grouped = new Map<string, Command[]>()

  for (const command of commands) {
    const category = command.category ?? 'util'
    if (!grouped.has(category)) {
      grouped.set(category, [])
    }
    const categoryGroup = grouped.get(category)
    if (categoryGroup !== undefined) {
      categoryGroup.push(command)
    }
  }

  return grouped
}

/**
 * Finds a command by name or alias
 * @param commandName - Command name or alias
 * @param commands - Array of commands
 * @returns The command if found, undefined otherwise
 */
export function findCommand (commandName: string, commands: Command[]): Command | undefined {
  const aliasMap = buildAliasMap(commands)
  const resolvedName = resolveAlias(commandName, aliasMap)
  return commands.find(cmd => cmd.name === resolvedName)
}

/**
 * Formats flag name for display
 * @param flag - The command flag
 * @returns Formatted string like "-v, --verbose"
 */
export function formatFlagName (flag: { short?: string, long?: string, name: string }): string {
  const parts: string[] = []

  if (flag.short !== undefined && flag.short !== '') {
    parts.push(`-${flag.short}`)
  }
  if (flag.long !== undefined && flag.long !== '') {
    parts.push(`--${flag.long}`)
  }

  if (parts.length === 0) {
    parts.push(`--${flag.name}`)
  }

  return parts.join(', ')
}
