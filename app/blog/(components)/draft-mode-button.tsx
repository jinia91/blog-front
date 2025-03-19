import React from 'react'
import { BsBook } from 'react-icons/bs'
import { useSectionMode } from '../(usecase)/section-toggle-usecases'

const DraftModeButton = (): React.ReactElement => {
  const { toggleSectionMode } = useSectionMode()
  return (
    <button
      className="flex items-center justify-center w-10 h-10 border border-yellow-400 rounded-lg bg-gray-900 text-orange-400 shadow-md hover:bg-gray-700 transition"
      onClick={toggleSectionMode}
    >
      <BsBook size={28}/>
    </button>
  )
}

export default DraftModeButton
