'use client'
import React from 'react'
import { useSession } from '../../../login/(usecase)/session-usecases'
import NewArticleButton from '../new-article-button'
import DraftModeButton from './draft-mode-button'
import { useSectionMode } from '../../(usecase)/section-toggle-usecases'
import { ArticleSearchInput } from './article-search'

export default function AsideSection (): React.ReactElement {
  const { session } = useSession()
  const { isPublishMode } = useSectionMode()

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

      {isPublishMode
        ? (
          <div className="mt-4">
          </div>
          )
        : null}
    </div>
  )
}
