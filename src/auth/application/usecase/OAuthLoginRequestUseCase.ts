import { getOAuthLoginUrl } from '@/auth/adapter/outbound/api/auth'

export async function executeOAuthLoginRequest (provider: string): Promise<{ url: string } | null> {
  return await getOAuthLoginUrl(provider)
}
