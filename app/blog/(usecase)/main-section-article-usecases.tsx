import { atom, useAtom } from 'jotai'
import { type Article } from '../(domain)/article'
import { fetchArticlesByOffset, searchArticleByKeyword } from '../(infra)/article'
import { type Tag } from '../(domain)/tag'

const articlesAtom = atom<Article[]>([])
const hasMoreAtom = atom<boolean>(true)
const selectedTagAtom = atom<Tag>()

export const useMainSectionRenderArticles = (): {
  initialLoad: () => Promise<void>
  renderLatestArticles: () => Promise<void>
  renderPublicArticlesByKeyword: (keyword: string) => Promise<void>
  hasMore: boolean
  loadedArticles: Article[]
} => {
  const [loadedArticles, setLoadedArticles] = useAtom(articlesAtom)
  const [hasMore, setHasMore] = useAtom(hasMoreAtom)

  const initialLoad = async (): Promise<void> => {
    const initialArticles = await fetchArticlesByOffset(null, 5, true)
    setLoadedArticles(initialArticles)
    setHasMore(true)
  }

  const renderLatestArticles = async (): Promise<void> => {
    const cursor = getLatestArticleCursor()
    const needToAdd = await fetchArticlesByOffset(cursor, 5, true)
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

  const renderPublicArticlesByKeyword = async (keyword: string): Promise<void> => {
    if (keyword === '') {
      await initialLoad()
      return
    }

    const articles = await searchArticleByKeyword(keyword)
    setLoadedArticles(articles)
    setHasMore(false)
  }

  return {
    hasMore,
    initialLoad,
    renderLatestArticles,
    renderPublicArticlesByKeyword,
    loadedArticles
  }
}
