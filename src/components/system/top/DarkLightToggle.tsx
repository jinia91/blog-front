'use client'
import React, { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import moon from '../../../../public/moon.png'
import sun from '../../../../public/sun.png'
import CommonModal from '@/components/system/common/CommonModal'

export default function DarkLightToggle (): React.ReactElement | null {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const [isModalOpen, setModalOpen] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  const handleToggle = (): void => {
    setTheme('dark')
    setModalOpen(true)
  }
  const handleClose = (): void => {
    setModalOpen(false)
  }
  return mounted
    ? (
      <>
        <button
          aria-label="Toggle Dark Mode"
          type="button"
          onClick={handleToggle}
        >
          {theme === 'dark'
            ? <Image src={moon} alt="Dark Mode" width={40} height={40}/>
            : <Image src={sun} alt="Light Mode" width={40} height={40}/>}
        </button>
        {isModalOpen && (
          <CommonModal onClose={handleClose}>
            <div className="dos-font text-center">
              <p>아직 다크모드만 지원합니다.</p>
            </div>
          </CommonModal>
        )}
      </>
      )
    : null
}
