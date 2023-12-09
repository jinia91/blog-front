export function getLocalStorage<T>(key: string): T | null {
  const item = localStorage.getItem(key)
  if (item) {
    try {
      return JSON.parse(item)
    } catch {
      localStorage.removeItem(key)
      return null
    }
  } else {
    return null
  }
}

export const setLocalStorage = <T>(key: string, newValue: T): void =>
  localStorage.setItem(key, JSON.stringify(newValue))
