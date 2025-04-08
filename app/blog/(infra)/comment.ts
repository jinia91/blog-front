import { withAuthRetry } from '../../login/(infra)/auth-api'
import { HOST } from '../../(utils)/constants'
import type { Comment } from '../(domain)/comment'

export async function createNewComment (
  articleId: number,
  userId: number | null,
  username: string | null,
  password: string | null,
  parentId: number | null,
  content: string
): Promise<number> {
  const apiCall = async (): Promise<Response> => {
    return await fetch(HOST + '/v1/comments', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        refId: articleId,
        refType: 'ARTICLE',
        userId,
        username,
        password,
        parentId,
        content
      })
    })
  }
  const response = await withAuthRetry(apiCall)
  if (!response.ok) {
    console.debug('댓글 생성 실패')
    return -1
  }
  const data = await response.json()
  return data.commentId
}

export async function fetchComments (articleId: number): Promise<Comment[]> {
  return mockComments
}

export async function postComment (articleId: number, parentId: number | null, nickname: string, password: string, content: string): Promise<Comment> {
  return {
    id: Math.floor(Math.random() * 10000),
    content,
    nickname,
    createdAt: new Date(),
    profileUrl: 'https://example.com/profile.jpg',
    children: []
  }
}

export const mockComments = [
  {
    id: 1,
    content: '최상위 댓글입니다.',
    nickname: '익명1',
    profileUrl: 'https://example.com/profile1.jpg',
    createdAt: new Date('2025-04-07 14:00'),
    children: [
      {
        id: 2,
        content: '답글입니다.',
        nickname: '익명2',
        profileUrl: 'https://example.com/profile1.jpg',
        createdAt: new Date('2025-04-07 14:05'),
        children: []
      }
    ]
  }
]
