'use client'
import { useState } from 'react'
import { type Tag } from '../(domain)/tag'
import { uploadImageToServer } from '../../memo/(infra)/memo'
import { Status } from '../(domain)/article'

export const useArticleEditSystem = (): {
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
  addTag: (tags: Tag) => void
  removeTag: (tag: Tag) => void
} => {
  const [articleTitle, setArticleTitle] = useState<string>('')
  const [articleContent, setArticleContent] = useState<string>('')
  const [tags, setArticleTags] = useState<Tag[]>([])
  const [thumbnail, setThumbnail] = useState<string>('')
  const [status, setStatus] = useState<Status>(Status.DRAFT)

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

  const addTag = (tag: Tag): void => {
    setArticleTags([...tags, tag])
  }

  const removeTag = (tag: Tag): void => {
    setArticleTags(tags.filter(t => t.id !== tag.id))
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
    setTags: setArticleTags,
    addTag,
    removeTag
  }
}
