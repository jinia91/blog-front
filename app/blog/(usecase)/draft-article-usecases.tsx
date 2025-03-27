import { atom, useAtom } from 'jotai'
import { type Article } from '../(domain)/article'
import { fetchArticlesByOffset } from '../(infra)/article'
import { useState } from 'react'

const draftArticle = atom<Article[]>([])

export const useLatestDraftArticles = (): {
  initialLoad: () => Promise<void>
  getLatestDraftArticles: () => Promise<void>
  loadedDraftArticles: Article[]
  hasMore: boolean
} => {
  const [loadedArticles, setLoadedArticles] = useAtom(draftArticle)
  const [hasMore, setHasMore] = useState(true)

  const initialLoad = async (): Promise<void> => {
    const initialArticles = await fetchArticlesByOffset(null, 5, false)
    setLoadedArticles(initialArticles)
  }

  const getLatestDraftArticles = async (): Promise<void> => {
    const cursor = getLatestArticleCursor()
    const needToAdd = await fetchArticlesByOffset(cursor, 5, false)
    if (needToAdd.length === 0) {
      setHasMore(false)
      return
    }
    setLoadedArticles([...loadedArticles, ...needToAdd])
  }

  const getLatestArticleCursor = (): number => {
    const sorted = loadedArticles.sort((a, b) => a.id - b.id)
    return sorted[sorted.length - 1].id
  }

  return {
    initialLoad,
    getLatestDraftArticles,
    hasMore,
    loadedDraftArticles: loadedArticles
  }
}
