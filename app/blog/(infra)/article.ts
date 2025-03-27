import { type Article } from '../(domain)/article'
import { HOST } from '../../(utils)/constants'
import { withAuthRetry } from '../../login/(infra)/auth-api'

export async function fetchArticlesByOffset (cursor: number | null, limit: number, isPublish: boolean): Promise<Article[]> {
  const status = isPublish ? 'PUBLISHED' : 'DRAFT'
  const refinedCursor = cursor ?? Number.MAX_SAFE_INTEGER - 1
  const apiCall = async (): Promise<Response> => {
    return await fetch(HOST + '/v1/articles/simple?cursor=' + refinedCursor + '&limit=' + limit + '&status=' + status, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-cache'
    })
  }
  const response = await withAuthRetry(apiCall)
  if (!response.ok) {
    console.error('아티클 조회 실패')
    return []
  }

  const data = await response.json()
  return data.map((article: any) => {
    return {
      id: article.id,
      title: article.title,
      content: article.content,
      thumbnail: article.thumbnailUrl,
      tags: Array.isArray(article.tags) ? article.tags : [],
      likes: 1,
      comments: 1,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      createdAt: new Date(article.createdAt),
      isPublished: true
    }
  })
}

export async function changeStatusArticle (id: string, asIs: string, toBe: string): Promise<boolean> {
  const apiCall = async (): Promise<Response> => {
    return await fetch(HOST + '/v1/articles/' + id, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ toBeStatus: toBe, asIsStatus: asIs })
    })
  }
  const response = await withAuthRetry(apiCall)
  return response.ok
}

export async function deleteArticle (id: string): Promise<boolean> {
  const apiCall = async (): Promise<Response> => {
    return await fetch(HOST + '/v1/articles/' + id, {
      method: 'DELETE',
      credentials: 'include'
    })
  }
  const response = await withAuthRetry(apiCall)
  return response.ok
}

export async function fetchArticleById (id: number, status: string): Promise<Article | undefined> {
  const apiCall = async (): Promise<Response> => {
    return await fetch(HOST + '/v1/articles/' + id + '?status=' + status, {
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
  return {
    id: data.id,
    title: data.title,
    content: data.content,
    thumbnail: data.thumbnailUrl,
    tags: data.tags,
    likes: 1,
    comments: 1,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    createdAt: new Date(data.createdAt),
    isPublished: data.isPublished
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

export async function searchArticleByKeyword (keyword: string): Promise<Article[]> {
  const apiCall = async (): Promise<Response> => {
    return await fetch(HOST + '/v1/articles/simple?status=PUBLISHED&keyword=' + keyword, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-cache'
    })
  }
  const response = await withAuthRetry(apiCall)
  if (!response.ok) {
    console.error('아티클 조회 실패')
    return []
  }
  const data = await response.json()
  return data.map((article: any) => {
    return {
      id: article.id,
      title: article.title,
      content: article.content,
      thumbnail: article.thumbnailUrl,
      tags: Array.isArray(article.tags) ? article.tags : [],
      likes: 1,
      comments: 1,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      createdAt: new Date(article.createdAt),
      isPublished: true
    }
  })
}
