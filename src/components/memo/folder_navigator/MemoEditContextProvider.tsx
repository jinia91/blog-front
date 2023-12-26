import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

const initialUnderwritingMemoContextValue = {
  underwritingTitle: '',
  underwritingId: '',
  setUnderwritingTitle: () => {
  },
  setUnderwritingId: () => {
  }
}

export const MemoEditContext = React.createContext<any>(initialUnderwritingMemoContextValue)

const initialReferenceModeContextValue = {
  isReferenceMode: false,
  setReferenceMode: () => {
  },
  refreshCount: 0,
  setRefreshCount: () => {
  }
}

export const ReferenceModeContext = React.createContext<any>(initialReferenceModeContextValue)

export function MemoEditContextProvider ({ children }: { children: React.ReactNode }): React.ReactElement {
  const [underwritingTitle, setUnderwritingTitle] = useState<string>('')
  const [underwritingId, setUnderwritingId] = useState<string>('')
  const [isReferenceMode, setReferenceMode] = useState<boolean>(false)
  const [refreshCount, setRefreshCount] = useState<number>(0)
  const pathname = usePathname()
  const isMemoTab = pathname.startsWith('/memo/')

  useEffect(() => {
    if (!isMemoTab) {
      setUnderwritingId('')
      setUnderwritingTitle('')
      setReferenceMode(false)
    }
  }, [pathname])

  return (
    <MemoEditContext.Provider value={{
      underwritingTitle,
      underwritingId,
      setUnderwritingTitle,
      setUnderwritingId
    }}>
      <ReferenceModeContext.Provider value={{ isReferenceMode, setReferenceMode, refreshCount, setRefreshCount }}>
        {children}
      </ReferenceModeContext.Provider>
    </MemoEditContext.Provider>
  )
}
