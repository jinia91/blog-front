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
