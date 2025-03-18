import { type Tag } from './tag'

export interface Article {
  id: number
  title: string
  content: string
  thumbnail: string
  tags: Tag[]
  likes: number
  comments: number
  createdAt: Date
  isPublished: boolean
}
