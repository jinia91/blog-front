'use client'
import type { Tag } from '../../(domain)/tag'
import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface TagButtonProps {
  tag: Tag
}

export const TagButton = ({ tag }: TagButtonProps): React.ReactElement => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleTagClick = (tag: Tag): void => {
    const params = new URLSearchParams(searchParams.toString())
    const currentTag = searchParams.get('tag')

    params.delete('keyword')
    params.delete('mode')

    if (currentTag === tag.name) {
      params.delete('tag')
    } else {
      params.set('tag', tag.name)
    }

    router.push(`?${params.toString()}`)
  }

  return (
    <button
      onClick={() => {
        handleTagClick(tag)
      }}
      className={
        searchParams.get('tag') === tag.name
          ? 'bg-green-600 text-green-100 px-2 py-1 rounded-full hover:bg-green-600 transition-colors'
          : 'bg-green-800 text-gray-100 px-2 py-1 rounded-full hover:bg-green-600 transition-color'
      }
    >
      #{tag.name}
    </button>
  )
}
