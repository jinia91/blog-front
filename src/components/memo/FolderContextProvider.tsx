import React, { useEffect, useState } from 'react'
import { fetchFolderAndMemo } from '@/api/memo'
import type { FolderInfo } from '@/api/models'

const initialFolderContextValue = {
  folders: [],
  setFolders: () => {
  },
  refreshFolders: () => {
  }
}

export const FolderContext = React.createContext<any>(initialFolderContextValue)

export function FolderContextProvider ({ children }: { children: React.ReactNode }): React.ReactElement {
  const [folders, setFolders] = useState<FolderInfo[] | null>(null)
  useEffect(() => {
    async function fetchData (): Promise<void> {
      try {
        const fetchedFolders = await fetchFolderAndMemo()
        setFolders(fetchedFolders)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    void fetchData()
  }, [])

  async function refreshFolders (): Promise<void> {
    const newFetchedFolders = await fetchFolderAndMemo()
    setFolders(newFetchedFolders)
  }

  if (folders == null) {
    return <></>
  }
  return (
    <FolderContext.Provider value={{ folders, setFolders, refreshFolders }}>
      {children}
    </FolderContext.Provider>
  )
}
