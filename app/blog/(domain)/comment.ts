export interface Comment {
  id: number
  content: string
  nickname: string
  profileUrl: string
  createdAt: Date
  children: Comment[]
}
