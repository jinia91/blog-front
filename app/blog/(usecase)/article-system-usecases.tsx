'use client'
import { atom, useAtom } from 'jotai'
import { type Tag } from '../(domain)/tag'
import { uploadImageToServer } from '../../memo/(infra)/memo'
import { Status } from '../(domain)/article'
import { addTagToArticle, removeTagToArticle } from '../(infra)/tag'

export interface ArticleEditSystem {
  articleTitle: string
  setArticleTitle: (title: string) => void
  articleContent: string
  setArticleContent: (content: string) => void
  thumbnail: string
  setThumbnail: (thumbnail: string) => void
  uploadThumbnail: (file: File) => Promise<void>
  uploadImageOnContents: (file: File) => Promise<void>
  status: Status
  setStatus: (status: Status) => void
  tags: Tag[]
  setTags: (tags: Tag[]) => void
  addTag: (articleId: number, newTagName: string) => Promise<void>
  removeTag: (articleId: number, tag: Tag) => Promise<void>
}

const articleTitleAtom = atom<string>('')
const articleContentAtom = atom<string>('')
const articleTagsAtom = atom<Tag[]>([])
const thumbnailAtom = atom<string>('')
const statusAtom = atom<Status>(Status.DRAFT)

export const useArticleEditSystem = (): ArticleEditSystem => {
  const [articleTitle, setArticleTitle] = useAtom(articleTitleAtom)
  const [articleContent, setArticleContent] = useAtom(articleContentAtom)
  const [tags, setTags] = useAtom(articleTagsAtom)
  const [thumbnail, setThumbnail] = useAtom(thumbnailAtom)
  const [status, setStatus] = useAtom(statusAtom)

  const uploadThumbnail = async (file: File): Promise<void> => {
    if (file != null) {
      const data = await uploadImageToServer(file)
      if (data === null) {
        throw new Error('이미지 업로드 통신 실패')
      }
      const imageUrl = data.url
      setThumbnail(imageUrl)
    }
  }

  const uploadImageOnContents = async (file: File): Promise<void> => {
    if (file != null) {
      const data = await uploadImageToServer(file)
      if (data === null) {
        throw new Error('이미지 업로드 통신 실패')
      }
      const imageUrl = data.url
      const markdownImageLink = `![uploaded image](${imageUrl})\n`
      setArticleContent(articleContent + markdownImageLink)
    }
  }

  const addTag = async (articleId: number, newTagName: string): Promise<void> => {
    if (newTagName.trim() === '' ||
      (tags.length > 0 &&
        tags.map(tag => tag.name.toLowerCase()).includes(newTagName.trim().toLowerCase()))) {
      console.error('이미 존재하는 태그입니다')
      return
    }
    await addTagToArticle(articleId, newTagName).then(() => {
      const tag: Tag = { name: newTagName }
      setTags([...tags, tag])
    }
    )
  }

  const removeTag = async (articleId: number, tag: Tag): Promise<void> => {
    await removeTagToArticle(articleId, tag.name).then(() => {
      setTags(tags.filter(t => t.name !== tag.name))
    })
  }

  return {
    articleTitle,
    setArticleTitle,
    articleContent,
    setArticleContent,
    thumbnail,
    setThumbnail,
    uploadThumbnail,
    uploadImageOnContents,
    status,
    setStatus,
    tags,
    setTags,
    addTag,
    removeTag
  }
}
