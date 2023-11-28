'use client'
import {useEffect, useState} from 'react'
import {useTheme} from 'next-themes'

export default function DarkLightToggle() {
  console.log("스위치 렌더링")
  
  const [mounted, setMounted] = useState(false)
  const {theme, setTheme} = useTheme()
  
  useEffect(() => setMounted(true), [])
  
  return mounted ? (
    <button
      aria-label='Toggle Dark Mode'
      type='button'
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? '🌙' : '☀'}
    </button>
    ) : null
}
