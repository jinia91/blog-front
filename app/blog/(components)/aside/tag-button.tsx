import type { Tag } from '../../(domain)/tag'
import React from 'react'

interface TagButtonProps {
  tag: Tag
  onClick: (tag: Tag) => void
  selected: boolean
}

export const TagButton = ({ tag, onClick, selected }: TagButtonProps): React.ReactElement => {
  return (
    <button
      onClick={() => {
        onClick(tag)
      }}
      className={
        selected
          ? 'bg-green-600 text-green-100 px-2 py-1 rounded-full hover:bg-green-600 transition-colors text-xs'
          : 'bg-green-800 text-gray-100 px-2 py-1 rounded-full hover:bg-green-600 transition-color'
      }
    >
      #{tag.name}
    </button>
  )
}
