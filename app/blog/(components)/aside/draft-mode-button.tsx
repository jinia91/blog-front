'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PublicIcon } from './Public-icon'
import { DraftIcon } from './Draft-icon'

const DraftModeButton = (): React.ReactElement => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentMode = searchParams.get('mode')
  const isPublishMode = (currentMode == null) || currentMode === 'publish'

  const toggleMode = (): void => {
    const newMode = isPublishMode ? 'draft' : 'publish'
    const params = new URLSearchParams(searchParams.toString())
    params.set('mode', newMode)
    router.push(`?${params.toString()}`)
  }

  return (
    <button
      className="flex items-center justify-center w-10 h-10 border border-yellow-400 rounded-lg bg-gray-900 text-orange-400 shadow-md hover:bg-gray-700 transition"
      onClick={toggleMode}
    >
      {isPublishMode ? <PublicIcon/> : <DraftIcon/>}
    </button>
  )
}

export default DraftModeButton
