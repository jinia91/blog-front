import { getOAuthLoginUrl } from '@/auth/infra/api/Auth'

export async function executeOAuthLoginRequest (provider: string): Promise<{ url: string } | null> {
  return await getOAuthLoginUrl(provider)
}
