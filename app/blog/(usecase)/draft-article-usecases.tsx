import { atom, useAtom } from 'jotai'
import { type Article } from '../(domain)/article'
import { fetchDraftArticlesByOffset } from '../(infra)/article'
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
    const initialArticles = await fetchDraftArticlesByOffset(1, 5)
    setLoadedArticles(initialArticles)
  }

  const getLatestDraftArticles = async (): Promise<void> => {
    const cursor = getLatestArticleCursor()
    const needToAdd = await fetchDraftArticlesByOffset(cursor, 5)
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
