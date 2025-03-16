import { atom, useAtom } from 'jotai'
import { type Tag } from '../(domain)/tag'
import { type Article } from '../(domain)/post'
import { fetchArticlesByOffset } from '../(infra)/article'

const tagsAtom = atom<Tag[]>([])
const selectedTagsAtom = atom<Tag[]>([])
const articlesAtom = atom<Article[]>([])

export const useBlogSystem = (): {
  initialLoad: () => Promise<void>
  getLatestArticles: () => Promise<void>
  tags: Tag[]
  selectedTags: Tag[]
  selectTag: (tag: Tag) => void
  unselectTag: (tag: Tag) => void
  getLatestArticleFilteredBySelectedTags: () => Article[]
} => {
  const [tags, setTags] = useAtom(tagsAtom)
  const [selectedTags, setSelectedTags] = useAtom(selectedTagsAtom)
  const [loadedArticles, setLoadedArticles] = useAtom(articlesAtom)
  const initialLoad = async (): Promise<void> => {
    const initialArticles = await fetchArticlesByOffset(0)
    setLoadedArticles(initialArticles)
    const tagMap = new Map<number, Tag>()
    initialArticles.forEach(post => {
      post.tags.forEach(tag => {
        tagMap.set(tag.id, tag)
      })
    })
    setTags([...tagMap.values()])
  }

  const getLatestArticles = async (): Promise<void> => {
    const cursor = getLatestArticleCursor()
    const needToAdd = await fetchArticlesByOffset(cursor)
    setLoadedArticles([...loadedArticles, ...needToAdd])
    const tagMap = new Map<number, Tag>()
    loadedArticles.forEach(post => {
      post.tags.forEach(tag => {
        tagMap.set(tag.id, tag)
      })
    })
    needToAdd.forEach(post => {
      post.tags.forEach(tag => {
        tagMap.set(tag.id, tag)
      })
    })
    setTags([...tagMap.values()])
  }

  const getLatestArticleCursor = (): number => {
    const sorted = loadedArticles.sort((a, b) => a.id - b.id)
    return sorted[sorted.length - 1].id
  }

  const getLatestArticleFilteredBySelectedTags = (): Article[] => {
    if (selectedTags.length === 0) {
      return loadedArticles
    }
    return loadedArticles.filter(post => selectedTags.some(tag => post.tags.map(t => t.id).includes(tag.id)))
  }

  const selectTag = (tag: Tag): void => {
    setSelectedTags([...selectedTags, tag])
  }

  const unselectTag = (tag: Tag): void => {
    setSelectedTags(selectedTags.filter(selectedTag => selectedTag.id !== tag.id))
  }

  return {
    initialLoad,
    getLatestArticles,
    getLatestArticleFilteredBySelectedTags,
    tags,
    selectedTags,
    unselectTag,
    selectTag
  }
}
