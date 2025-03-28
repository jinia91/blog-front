import { atom, useAtom } from 'jotai'
import { fetchArticleCardsByOffset, fetchArticleCardsByTag, searchArticleCardsByKeyword } from '../(infra)/article-card'
import { type Tag } from '../(domain)/tag'
import { type ArticleCardViewModel } from '../(domain)/article-card-view-model'

const articleCardVmAtom = atom<ArticleCardViewModel[]>([])
const hasMoreAtom = atom<boolean>(true)
const selectedTagAtom = atom<Tag>()

export const useManageArticleCardViewModels = (): {
  initialLoad: () => Promise<void>
  renderLatestArticleCards: () => Promise<void>
  renderPublicArticleCardsByKeyword: (keyword: string) => Promise<void>
  hasMore: boolean
  loadedArticles: ArticleCardViewModel[]
  selectedTag: Tag | undefined
  setSelectedTag: (tag: Tag) => void
  renderTaggedArticleCards: () => Promise<void>
} => {
  const [loadedArticles, setLoadedArticles] = useAtom(articleCardVmAtom)
  const [hasMore, setHasMore] = useAtom(hasMoreAtom)
  const [selectedTag, setSelectedTag] = useAtom(selectedTagAtom)

  const initialLoad = async (): Promise<void> => {
    const initialArticles = await fetchArticleCardsByOffset(null, 5, true)
    setLoadedArticles(initialArticles)
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
    setHasMore(false)
  }

  const renderTaggedArticleCards = async (): Promise<void> => {
    if (selectedTag == null) {
      await initialLoad()
      return
    }

    const articlesByTag = await fetchArticleCardsByTag(selectedTag.name)
    setLoadedArticles(articlesByTag)
    setHasMore(false)
  }

  return {
    hasMore,
    initialLoad,
    renderLatestArticleCards,
    renderPublicArticleCardsByKeyword,
    loadedArticles,
    setSelectedTag,
    selectedTag,
    renderTaggedArticleCards
  }
}
