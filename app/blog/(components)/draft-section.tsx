'use client'
import React, { useCallback, useEffect, useRef } from 'react'
import PostCard from './post-card'
import { useLatestDraftArticles } from '../(usecase)/draft-article-usecases'

export default function DraftSection (): React.ReactElement {
  const {
    initialLoad,
    getLatestDraftArticles,
    hasMore,
    loadedDraftArticles
  } = useLatestDraftArticles()
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastPostRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    void initialLoad()
  }, [])

  const loadMorePosts = useCallback(async () => {
    if (!hasMore) return
    await getLatestDraftArticles()
  }, [getLatestDraftArticles, hasMore])

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
  }, [loadMorePosts, hasMore])

  return (
    <div className="relative flex flex-col bg-gray-900 text-gray-300 border-2 animate-glow border-green-400 m-2">
      <header className="px-2 py-2">
        <div className="flex items-center">
          <div className="flex-grow border-t animate-glow border-green-400"></div>
          <h1 className="px-2 text-lg font-bold text-green-400">{'Draft Posts'}</h1>
          <div className="flex-grow border-t animate-glow border-green-400"></div>
        </div>
      </header>

      <main className="flex flex-col gap-2 p-10">
        {loadedDraftArticles.map((article, index) => (
          <div key={article.id} ref={index === loadedDraftArticles.length - 1 ? lastPostRef : null}>
            <PostCard article={article}/>
          </div>
        ))}
      </main>

      {!hasMore && (
        <p className="text-center text-gray-500 p-2 text-lg">No more posts</p>
      )}
    </div>
  )
}
