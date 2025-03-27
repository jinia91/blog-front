import type { Tag } from './tag'

export interface ArticleCardViewModel {
  id: number
  title: string
  content: string
  thumbnail: string
  tags: Tag[]
  likesCount: number
  commentsCount: number
  createdAt: Date
  isPublished: boolean
}
