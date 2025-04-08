'use client'
import React, { useEffect, useState } from 'react'
import { useSession } from '../../../login/(usecase)/session-usecases'
import NewArticleButton from '../new-article-button'
import DraftModeButton from './draft-mode-button'
import { ArticleSearchInput } from './article-search'
import { fetchTopNTags } from '../../(infra)/tag'
import { type Tag } from '../../(domain)/tag'
import { TagButton } from './tag-button'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AsideSection (
  { isPublishMode }: {
    isPublishMode: boolean
  }
): React.ReactElement {
  const { session } = useSession()

  const [tags, setTags] = useState<Tag[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchTags = async (): Promise<void> => {
      const tags = await fetchTopNTags(10)
      setTags(tags)
    }

    void fetchTags()
  }, [])

  return (
    <div className="border-2 border-b-green-400 h-full p-2 animate-glow border-green-400">
      {(session?.roles.values().next().value === 'ADMIN' && (
        <div
          className='flex justify-between w-full mt-2 mb-4'>
          <div className='tooltip'>
            <span className="tooltip-message  ml-10">{isPublishMode ? 'Published' : 'Draft'}</span>
            <DraftModeButton/>
          </div>
          <div className='tooltip'>
            <span className="tooltip-message ml-10">새 포스트</span>
            <NewArticleButton/>
          </div>
        </div>
      ))}
      <ArticleSearchInput/>

      <div className="border-t border-green-400 animate-glow mt-4 mb-4"/>

      {isPublishMode
        ? (
          <div className="">
            <h2 className="text-lg font-bold text-green-300 mb-2">Recommended Tags</h2>
            <div className="flex flex-wrap gap-2 text-sm">
              {tags.map(tag => (
                <TagButton key={tag.name} tag={tag}/>
              ))}
            </div>
          </div>
          )
        : null}
    </div>
  )
}
