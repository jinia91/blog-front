import { withAuthRetry } from '../../login/(infra)/auth-api'
import { HOST } from '../../(utils)/constants'

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
