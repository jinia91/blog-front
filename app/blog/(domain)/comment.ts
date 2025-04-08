export interface Comment {
  id: number
  content: string
  nickname: string
  authorId: number | null
  profileImageUrl: string | null
  createdAt: Date
  children: Comment[]
}
