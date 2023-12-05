'use client'
import {useEffect, useState} from 'react'
import {useTheme} from 'next-themes'
import Image from 'next/image'
import moon from '../../public/moon.png'
import sun from '../../public/sun.png'

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
      {theme === 'dark' ? <Image src={moon} alt={"Dark Mode"} width={40} height={40}/>
        : <Image src={sun} alt={"Light Mode"}  width={40} height={40}/>}
    </button>
    ) : null
}
