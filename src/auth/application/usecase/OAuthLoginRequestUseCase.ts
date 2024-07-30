import { getOAuthLoginUrl } from '@/auth/infra/api/auth'

export async function executeOAuthLoginRequest (provider: string): Promise<{ url: string } | null> {
  return await getOAuthLoginUrl(provider)
}
