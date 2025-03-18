import { type Article } from '../(domain)/article'
import { mocks } from './mocks'
import { HOST } from '../../(utils)/constants'
import { withAuthRetry } from '../../login/(infra)/auth-api'

export async function fetchArticlesByOffset (cursor: number): Promise<Article[]> {
  if (cursor === 0) {
    return mocks.slice(0, 5)
  }
  return mocks.slice(cursor, cursor + 5)
}

export async function fetchArticleById (id: number): Promise<Article | undefined> {
  const apiCall = async (): Promise<Response> => {
    return await fetch(HOST + '/v1/articles/' + id, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-cache'
    })
  }
  const response = await withAuthRetry(apiCall)
  if (!response.ok) {
    console.error('아티클 조회 실패')
    return undefined
  }
  const data = await response.json()
  console.log(data)
  return {
    id: data.id,
    title: data.title,
    content: data.content,
    thumbnail: data.thumbnailUrl,
    tags: data.tags,
    likes: 1,
    comments: 1,
    createdAt: new Date(data.createdAt)
  }
}

export async function initDraftArticle (): Promise<string | null> {
  const apiCall = async (): Promise<Response> => {
    return await fetch(HOST + '/v1/articles', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
  const response = await withAuthRetry(apiCall)
  if (!response.ok) {
    console.error('메모 생성 실패')
    return null
  }
  const data = await response.json()
  return data.articleId
}
