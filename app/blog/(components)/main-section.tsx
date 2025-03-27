'use client'
import React, { useCallback, useEffect, useRef } from 'react'
import ArticleCard from './article-card'
import { useManageArticleCardViewModels } from '../(usecase)/main-section-article-usecases'

export default function MainSection (): React.ReactElement {
  const {
    initialLoad,
    renderLatestArticleCards,
    hasMore,
    loadedArticles
  } = useManageArticleCardViewModels()
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastPostRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    void initialLoad()
  }, [])

  const loadMorePosts = useCallback(async () => {
    if (!hasMore) return
    await renderLatestArticleCards()
  }, [renderLatestArticleCards, hasMore])

  useEffect(() => {
    if (lastPostRef.current == null || !hasMore) return
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          void loadMorePosts()
        }
      },
      { threshold: 1.0 }
    )

    observerRef.current.observe(lastPostRef.current)
    return () => {
      if (observerRef.current != null) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, loadedArticles])

  return (
    <div className="relative flex flex-col bg-gray-900 text-gray-300 border-2 animate-glow border-green-400 m-2">
      <header className="px-2 py-2">
        <div className="flex items-center">
          <div className="flex-grow border-t animate-glow border-green-400"></div>
          <h1 className="px-2 text-lg font-bold text-green-400">{'Latest Posts'}</h1>
          <div className="flex-grow border-t animate-glow border-green-400"></div>
        </div>
      </header>

      <main className="flex flex-col gap-2 p-10">
        {loadedArticles.map((post, index) => (
          <div key={post.id}
               ref={index === loadedArticles.length - 1 ? lastPostRef : null}>
            <ArticleCard article={post} isPublished={true}/>
          </div>
        ))}
      </main>

      {!hasMore && (
        <p className="text-center text-gray-500 p-2 text-lg">No more posts</p>
      )}
    </div>
  )
}
