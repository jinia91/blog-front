'use client'
import React from 'react'
import { FiSearch } from 'react-icons/fi'
import { useMainSectionRenderArticles } from '../../(usecase)/main-section-article-usecases'
import { useDebouncedCallback } from 'use-debounce'

export const ArticleSearchInput = (): React.ReactElement => {
  const { renderPublicArticlesByKeyword } = useMainSectionRenderArticles()

  const searchArticleCallback = useDebouncedCallback(async (value: string) => {
    await renderPublicArticlesByKeyword(value)
  }, 500)

  return (
    <div className="relative w-full">
      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400"/>
      <input
        type="text"
        onInput={(e) => {
          void searchArticleCallback(e.currentTarget.value)
        }}
        placeholder="검색어를 입력하세요..."
        className="w-full pl-10 pr-3 p-2 bg-gray-900 text-white border border-green-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200 hover:border-green-300 hover:bg-gray-800"
      />
    </div>
  )
}
