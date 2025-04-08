import ArticleCard from './article-card'
import React from 'react'
import { fetchArticleCardsByOffset, fetchArticleCardsByTag, searchArticleCardsByKeyword } from '../(infra)/article-card'
import { type ArticleSearchParam } from '../page'
import { InfinityScrollSection } from './InfinityScrollSection'

export default async function MainSection ({ searchParams }: ArticleSearchParam): Promise<React.ReactElement> {
  const isPublishMode = (searchParams.mode == null || searchParams.mode === 'publish') &&
    (searchParams.tag == null && searchParams.keyword == null)
  const isDraftMode = searchParams.mode === 'draft' &&
    (searchParams.tag == null && searchParams.keyword == null)

  console.log(searchParams)

  const { initialArticles, lastCursor } = await (async () => {
    if (isPublishMode) {
      const articles = await fetchArticleCardsByOffset(null, 20, true)
      return {
        initialArticles: articles,
        lastCursor: articles[articles.length - 1]?.id ?? 0
      }
    } else if (isDraftMode) {
      return {
        initialArticles: [],
        lastCursor: Number.MAX_SAFE_INTEGER - 1
      }
    } else if (searchParams.tag != null) {
      const articles = await fetchArticleCardsByTag(searchParams.tag)
      return {
        initialArticles: articles,
        lastCursor: 0
      }
    } else if (searchParams.keyword != null) {
      const articles = await searchArticleCardsByKeyword(searchParams.keyword)
      return {
        initialArticles: articles,
        lastCursor: 0
      }
    }
    return { initialArticles: [], lastCursor: 0 }
  })()

  return (
    <div className="relative flex flex-col bg-gray-900 text-gray-300 border-2 animate-glow border-green-400 m-2">
      <header className="px-2 py-2">
        <div className="flex items-center">
          <div className="flex-grow border-t animate-glow border-green-400"></div>
          <h1 className="px-2 text-lg font-bold text-green-400">
            {searchParams.tag != null ? `#${searchParams.tag}` : searchParams.keyword != null ? `#${searchParams.keyword}` : 'Latest Articles'}
          </h1>
          <div className="flex-grow border-t animate-glow border-green-400"></div>
        </div>
      </header>

      <main className="flex flex-col gap-2 sm:p-10 p-1">
        {initialArticles.map((post) => (
          <div key={post.id}>
            <ArticleCard article={post} isPublished={isPublishMode}/>
          </div>
        ))}
        {(isPublishMode || isDraftMode) && (
          <InfinityScrollSection
            searchParams={searchParams}
            lastArticleId={lastCursor}
          />
        )}
      </main>

      <p className="text-center text-gray-400 p-2 text-lg">No more posts</p>
    </div>
  )
}
