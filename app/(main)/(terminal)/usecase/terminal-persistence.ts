const STORAGE_KEYS = {
  HISTORY: 'terminal_history',
  THEME: 'terminal_theme',
  ALIASES: 'terminal_aliases'
}

export function saveHistory (history: string[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history))
  } catch (error) {
    console.error('Failed to save history:', error)
  }
}

export function loadHistory (): string[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.HISTORY)
    return stored !== null && stored !== undefined ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to load history:', error)
    return []
  }
}

export function saveTheme (theme: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme)
  } catch (error) {
    console.error('Failed to save theme:', error)
  }
}

export function loadTheme (): string {
  if (typeof window === 'undefined') return 'green'
  try {
    return localStorage.getItem(STORAGE_KEYS.THEME) ?? 'green'
  } catch (error) {
    console.error('Failed to load theme:', error)
    return 'green'
  }
}

export function saveAliases (aliases: Record<string, string>): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEYS.ALIASES, JSON.stringify(aliases))
  } catch (error) {
    console.error('Failed to save aliases:', error)
  }
}

export function loadAliases (): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ALIASES)
    return stored !== null && stored !== undefined ? JSON.parse(stored) : {}
  } catch (error) {
    console.error('Failed to load aliases:', error)
    return {}
  }
}
