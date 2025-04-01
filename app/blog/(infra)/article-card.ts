import { HOST } from '../../(utils)/constants'
import { withAuthRetry } from '../../login/(infra)/auth-api'
import { type ArticleCardViewModel } from '../(domain)/article-card-view-model'

export async function fetchArticleCardsByOffset (cursor: number | null, limit: number, isPublish: boolean): Promise<ArticleCardViewModel[]> {
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
    console.debug('아티클 조회 실패')
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

export async function searchArticleCardsByKeyword (keyword: string): Promise<ArticleCardViewModel[]> {
  const apiCall = async (): Promise<Response> => {
    return await fetch(HOST + '/v1/articles/simple?status=PUBLISHED&keyword=' + keyword, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-cache'
    })
  }
  const response = await withAuthRetry(apiCall)
  if (!response.ok) {
    console.debug('아티클 조회 실패')
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

export async function fetchArticleCardsByTag (tagName: string): Promise<ArticleCardViewModel[]> {
  const apiCall = async (): Promise<Response> => {
    return await fetch(HOST + '/v1/articles/simple?status=PUBLISHED&tagName=' + tagName, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-cache'
    })
  }
  const response = await withAuthRetry(apiCall)
  if (!response.ok) {
    console.debug('아티클 조회 실패')
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
