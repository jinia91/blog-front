'use client'

import React, { useEffect, useRef, useState } from 'react'
import ArticleCard from './article-card'
import { fetchArticleCardsByOffset } from '../(infra)/article-card'
import { type ArticleCardViewModel } from '../(domain)/article-card-view-model'

export interface InfinityScrollProps {
  searchParams: {
    mode?: string
    tag?: string
    keyword?: string
  }
  lastArticleId: number | null
}

export const InfinityScrollSection = (
  { searchParams, lastArticleId }: InfinityScrollProps
): React.ReactElement => {
  const [articles, setArticles] = useState<ArticleCardViewModel[]>([])
  const [cursor, setCursor] = useState<number>(lastArticleId ?? 0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observerRef = useRef<HTMLDivElement | null>(null)
  const isPublishMode = (searchParams.mode == null) || searchParams.mode === 'publish'

  useEffect(() => {
    setArticles([])
    setCursor(lastArticleId ?? 0)
    setHasMore(true)
    setLoading(false)
  }, [searchParams])

  const fetchMore = async (): Promise<void> => {
    if (loading || !hasMore || cursor === null) return
    setLoading(true)

    const newArticles = await fetchArticleCardsByOffset(cursor, 10, isPublishMode)

    if (newArticles.length > 0) {
      const last = newArticles[newArticles.length - 1]
      setCursor(last.id)
      setArticles((prev) => [...prev, ...newArticles])
    } else {
      setHasMore(false)
    }

    setLoading(false)
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          void fetchMore()
        }
      },
      { threshold: 1.0 }
    )

    if (observerRef.current != null) observer.observe(observerRef.current)
    return () => {
      if (observerRef.current != null) observer.unobserve(observerRef.current)
    }
  }, [hasMore, cursor, searchParams])

  return (
    <>
      {articles.map((post) => (
        <div key={post.id}>
          <ArticleCard article={post} isPublished={true}/>
        </div>
      ))}
      <div ref={observerRef} className="h-10"/>
      {loading && <p className="text-center text-sm text-gray-400">Loading...</p>}
    </>
  )
}
