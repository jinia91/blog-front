import { useState } from 'react'
import { type Tag } from '../(domain)/tag'
import { uploadImageToServer } from '../../memo/(infra)/memo'

export const useArticleEditSystem = (): {
  articleTitle: string
  setArticleTitle: (title: string) => void
  articleContent: string
  setArticleContent: (content: string) => void
  articleTags: Tag[]
  setArticleTags: (tags: Tag[]) => void
  thumbnail: string
  setThumbnail: (thumbnail: string) => void
  uploadThumbnail: (file: File) => Promise<void>
  uploadImageOnContents: (file: File) => Promise<void>
} => {
  const [articleTitle, setArticleTitle] = useState<string>('')
  const [articleContent, setArticleContent] = useState<string>('')
  const [articleTags, setArticleTags] = useState<Tag[]>([])
  const [thumbnail, setThumbnail] = useState<string>('')

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

  return {
    articleTitle,
    setArticleTitle,
    articleContent,
    setArticleContent,
    articleTags,
    setArticleTags,
    thumbnail,
    setThumbnail,
    uploadThumbnail,
    uploadImageOnContents
  }
}
