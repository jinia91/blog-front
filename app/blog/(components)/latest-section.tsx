'use client'
import React, { useCallback, useEffect, useRef } from 'react'
import PostCard from './post-card'
import { useBlogSystem } from '../(usecase)/blog-system-usecases'

export default function LatestSection (): React.ReactElement {
  const { initialLoad, getLatestArticleFilteredBySelectedTags, getLatestArticles, selectedTags } = useBlogSystem()
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastPostRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    void initialLoad()
  }, [])

  const loadMorePosts = useCallback(async () => {
    await getLatestArticles()
  }, [getLatestArticles, getLatestArticleFilteredBySelectedTags])

  useEffect(() => {
    if (lastPostRef.current == null) return

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
  }, [loadMorePosts, getLatestArticleFilteredBySelectedTags])

  return (
    <div className="relative flex flex-col bg-gray-900 text-gray-300 border-2 animate-glow border-green-400 m-2">
      <header className="px-2 py-2">
        <div className="flex items-center">
          <div className="flex-grow border-t animate-glow border-green-400"></div>
          <h1 className="px-2 text-lg font-bold text-green-400">{
            selectedTags.length > 0
              ? `#${selectedTags.map(tag => tag.name).join(', ')}`
              : 'Latest Posts'
          }</h1>
          <div className="flex-grow border-t animate-glow border-green-400"></div>
        </div>
      </header>

      <main className="flex flex-col gap-2 p-2">
        {getLatestArticleFilteredBySelectedTags().map((post, index) => (
          <div key={post.id} ref={index === getLatestArticleFilteredBySelectedTags().length - 1 ? lastPostRef : null}>
            <PostCard article={post}/>
          </div>
        ))}
      </main>
    </div>
  )
}
