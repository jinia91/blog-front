import React from 'react'
import { useSectionMode } from '../(usecase)/section-toggle-usecases'
import { PublicIcon } from './Public-icon'
import { DraftIcon } from './Draft-icon'

const DraftModeButton = (): React.ReactElement => {
  const { isPublishMode, toggleSectionMode } = useSectionMode()
  return (
    <button
      className="flex items-center justify-center w-10 h-10 border border-yellow-400 rounded-lg bg-gray-900 text-orange-400 shadow-md hover:bg-gray-700 transition"
      onClick={toggleSectionMode}
    >
      {isPublishMode ? <PublicIcon/> : <DraftIcon/>}
    </button>
  )
}

export default DraftModeButton
