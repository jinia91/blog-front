import { getOAuthLoginUrl } from '../(infra)/auth'

export async function executeOAuthLoginRequest (provider: string): Promise<{ url: string } | null> {
  return await getOAuthLoginUrl(provider)
}
