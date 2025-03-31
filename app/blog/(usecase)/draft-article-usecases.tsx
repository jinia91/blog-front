import { atom, useAtom } from 'jotai'
import { fetchArticleCardsByOffset } from '../(infra)/article-card'
import { useState } from 'react'
import { type ArticleCardViewModel } from '../(domain)/article-card-view-model'

const draftArticle = atom<ArticleCardViewModel[]>([])

export const useLatestDraftArticles = (): {
  initialLoad: () => Promise<void>
  getLatestDraftArticles: () => Promise<void>
  loadedDraftArticles: ArticleCardViewModel[]
  hasMore: boolean
} => {
  const [loadedArticles, setLoadedArticles] = useAtom(draftArticle)
  const [hasMore, setHasMore] = useState(true)

  const initialLoad = async (): Promise<void> => {
    const initialArticles = await fetchArticleCardsByOffset(null, 5, false)
    setLoadedArticles(initialArticles)
  }

  const getLatestDraftArticles = async (): Promise<void> => {
    const cursor = getLatestArticleCursor()
    const needToAdd = await fetchArticleCardsByOffset(cursor, 5, false)
    if (needToAdd.length === 0) {
      setHasMore(false)
      return
    }
    setLoadedArticles([...loadedArticles, ...needToAdd])
  }

  const getLatestArticleCursor = (): number => {
    const sorted = loadedArticles.sort((a, b) => b.id - a.id)
    return sorted[sorted.length - 1].id
  }

  return {
    initialLoad,
    getLatestDraftArticles,
    hasMore,
    loadedDraftArticles: loadedArticles
  }
}
