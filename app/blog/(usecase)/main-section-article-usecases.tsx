import { atom, useAtom } from 'jotai'
import { fetchArticleCardsByOffset, fetchArticleCardsByTag, searchArticleCardsByKeyword } from '../(infra)/article-card'
import { type Tag } from '../(domain)/tag'
import { type ArticleCardViewModel } from '../(domain)/article-card-view-model'

const articleCardVmAtom = atom<ArticleCardViewModel[]>([])
const hasMoreAtom = atom<boolean>(true)
const selectedTagAtom = atom<Tag | null>(null)

export const useManageArticleCardViewModels = (): {
  initialLoad: () => Promise<void>
  renderLatestArticleCards: () => Promise<void>
  renderPublicArticleCardsByKeyword: (keyword: string) => Promise<void>
  hasMore: boolean
  loadedArticles: ArticleCardViewModel[]
  renderArticleCardsByTag: (tag: Tag) => Promise<void>
  selectedTag: Tag | null
} => {
  const [loadedArticles, setLoadedArticles] = useAtom(articleCardVmAtom)
  const [hasMore, setHasMore] = useAtom(hasMoreAtom)
  const [selectedTag, setSelectedTag] = useAtom(selectedTagAtom)

  const initialLoad = async (): Promise<void> => {
    const initialArticles = await fetchArticleCardsByOffset(null, 5, true)
    setLoadedArticles(initialArticles)
    setSelectedTag(null)
    setHasMore(true)
  }

  const renderLatestArticleCards = async (): Promise<void> => {
    const cursor = getLatestArticleCardsCursor()
    const needToAdd = await fetchArticleCardsByOffset(cursor, 5, true)
    if (needToAdd.length === 0) {
      setHasMore(false)
      return
    }
    setLoadedArticles([...loadedArticles, ...needToAdd])
  }

  const getLatestArticleCardsCursor = (): number => {
    const sorted = loadedArticles.sort((a, b) => b.id - a.id)
    return sorted[sorted.length - 1].id
  }

  const renderPublicArticleCardsByKeyword = async (keyword: string): Promise<void> => {
    if (keyword === '') {
      await initialLoad()
      return
    }

    const articleCards = await searchArticleCardsByKeyword(keyword)
    setLoadedArticles(articleCards)
    setSelectedTag(null)
    setHasMore(false)
  }

  const renderArticleCardsByTag = async (tag: Tag): Promise<void> => {
    if (tag === selectedTag) {
      void initialLoad()
      return
    }
    setSelectedTag(tag)
    const articlesByTag = await fetchArticleCardsByTag(tag.name)
    setLoadedArticles(articlesByTag)
    setHasMore(false)
  }

  return {
    hasMore,
    initialLoad,
    renderLatestArticleCards,
    renderPublicArticleCardsByKeyword,
    loadedArticles,
    renderArticleCardsByTag,
    selectedTag
  }
}
