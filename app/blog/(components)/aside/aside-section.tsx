'use client'
import React from 'react'
import { useLatestArticles } from '../../(usecase)/latest-article-usecases'
import { type Tag } from '../../(domain)/tag'
import { useSession } from '../../../login/(usecase)/session-usecases'
import NewArticleButton from '../new-article-button'
import DraftModeButton from './draft-mode-button'
import { useSectionMode } from '../../(usecase)/section-toggle-usecases'

export default function AsideSection (): React.ReactElement {
  const { tags, selectedTags, selectTag, unselectTag } = useLatestArticles()
  const { session } = useSession()
  const { isPublishMode } = useSectionMode()

  const handleTagClick = (tag: Tag): void => {
    if (selectedTags.some(selectedTag => selectedTag.id === tag.id)) {
      unselectTag(tag)
    } else {
      selectTag(tag)
    }
  }

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
      <input
        type="text"
        placeholder="Search"
        className="w-full p-2 bg-gray-900 text-white border border-green-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
      />

      {isPublishMode
        ? (
          <div className="mt-4">
            {/* <h3 className="text-green-400 font-bold mb-2">Tags</h3> */}
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => {
                    handleTagClick(tag)
                  }}
                  className={`px-3 py-1 rounded-md border font-medium transition-all
                ${
                    selectedTags.map(selectedTag => selectedTag.id).includes(tag.id)
                      ? 'bg-green-700 text-white border-green-700'
                      : 'border-green-400 text-green-300'
                  }
                hover:bg-green-500 hover:text-white hover:border-green-500`}
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          </div>
          )
        : null}
    </div>
  )
}
