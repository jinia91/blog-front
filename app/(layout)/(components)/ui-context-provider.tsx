'use client'
import { ThemeProvider } from 'next-themes'
import React, { useEffect } from 'react'

export default function UiContextProvider ({ children }: { children: React.ReactNode }): React.ReactElement | null {
  const [mounted, setMounted] = React.useState(false)
  console.log('ui context provider 렌더링 횟수 체크')
  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted
    ? (
      <ThemeProvider attribute='class'>
        {children}
      </ThemeProvider>
      )
    : null
}
