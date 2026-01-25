import { atom, useAtom } from 'jotai'

const OPEN_FOLDERS_KEY = 'openFolders'

const getInitialOpenFolders = (): Set<number> => {
  if (typeof window === 'undefined') return new Set()
  const stored = localStorage.getItem(OPEN_FOLDERS_KEY)
  if (stored !== null) {
    try {
      return new Set(JSON.parse(stored) as number[])
    } catch {
      return new Set()
    }
  }
  return new Set()
}

const openFoldersAtom = atom<Set<number>>(new Set<number>())

export const useOpenFolders = (): {
  openFolders: Set<number>
  toggleFolder: (folderId: number) => void
  openFolder: (folderId: number) => void
  collapseAll: () => void
  initializeFromStorage: () => void
} => {
  const [openFolders, setOpenFolders] = useAtom(openFoldersAtom)

  const initializeFromStorage = (): void => {
    setOpenFolders(getInitialOpenFolders())
  }

  const saveToStorage = (folders: Set<number>): void => {
    localStorage.setItem(OPEN_FOLDERS_KEY, JSON.stringify(Array.from(folders)))
  }

  const toggleFolder = (folderId: number): void => {
    setOpenFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
      }
      saveToStorage(newSet)
      return newSet
    })
  }

  const openFolder = (folderId: number): void => {
    setOpenFolders(prev => {
      if (prev.has(folderId)) return prev
      const newSet = new Set(prev)
      newSet.add(folderId)
      saveToStorage(newSet)
      return newSet
    })
  }

  const collapseAll = (): void => {
    const emptySet = new Set<number>()
    saveToStorage(emptySet)
    setOpenFolders(emptySet)
  }

  return {
    openFolders,
    toggleFolder,
    openFolder,
    collapseAll,
    initializeFromStorage
  }
}
