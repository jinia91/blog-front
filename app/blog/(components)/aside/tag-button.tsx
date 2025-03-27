import type { Tag } from '../../(domain)/tag'
import React from 'react'

interface TagButtonProps {
  tag: Tag
  onClick: (tag: Tag) => void
}

export const TagButton = ({ tag, onClick }: TagButtonProps): React.ReactElement => {
  return (
    <button
      onClick={() => {
        onClick(tag)
      }}
      className="bg-green-800 text-green-100 px-2 py-1 rounded-full hover:bg-green-600 transition-colors text-xs"
    >
      #{tag.name}
    </button>
  )
}
