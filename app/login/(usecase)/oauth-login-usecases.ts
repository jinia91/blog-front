import { getOAuthLoginUrl } from '../(infra)/auth'

export async function executeOAuthLoginRequest (provider: string): Promise<{ url: string }> {
  const url = await getOAuthLoginUrl(provider)
  if (url == null) {
    throw new Error('OAuth login URL 가져오기 실패')
  }
  return url
}
