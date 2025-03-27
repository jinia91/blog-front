import { HOST } from '../../(utils)/constants'
import { withAuthRetry } from '../../login/(infra)/auth-api'
import { type Tag } from '../(domain)/tag'

export async function fetchTopNTags (n: number): Promise<Tag[]> {
  const apiCall = async (): Promise<Response> => {
    return await fetch(HOST + '/v1/tags/top?n=' + n, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-cache'
    })
  }
  const response = await withAuthRetry(apiCall)
  if (!response.ok) {
    console.error('사용 상위 태그 조회 실패')
    return []
  }
  const data = await response.json()
  const tagMap: Map<number, string> | null = data.tags
  if (tagMap == null || Object.keys(tagMap).length === 0) {
    return []
  }
  return Array.from(tagMap.entries()).map(([id, name]) => ({ id, name }))
}

export async function addTagToArticle (articleId: number, tagName: string): Promise<Tag> {
  const apiCall = async (): Promise<Response> => {
    return await fetch(HOST + '/v1/articles/' + articleId + '/tags', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: tagName })
    })
  }
  const response = await withAuthRetry(apiCall)
  if (!response.ok) {
    throw new Error('태그 추가 실패')
  }
  const data = await response.json()
  return { id: data.id, name: data.name }
}

export async function removeTagToArticle (articleId: number, tagId: number): Promise<boolean> {
  const apiCall = async (): Promise<Response> => {
    return await fetch(HOST + '/v1/articles/' + articleId + '/tags/' + tagId, {
      method: 'DELETE',
      credentials: 'include'
    })
  }
  const response = await withAuthRetry(apiCall)
  if (!response.ok) {
    throw new Error('태그 삭제 실패')
  }
  return true
}
