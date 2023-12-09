'use client'
import {ThemeProvider} from 'next-themes'
import React, {useEffect} from "react"

export default function UiContext({children}: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)
  
  useEffect(() => setMounted(true), [])
  
  return mounted ? (
    <ThemeProvider attribute='class'>
      {children}
    </ThemeProvider>
  ) : null
}