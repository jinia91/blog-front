export interface Post {
  id: number
  title: string
  content: string
  thumbnail: string
  tags: string[]
  likes: number
  comments: number
  createdAt: Date
}
