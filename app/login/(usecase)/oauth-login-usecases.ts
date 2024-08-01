import { getOAuthLoginUrl } from '../(infra)/auth'
import { FAIL_TO_LOGIN_WITH_PROVIDER } from '../../(utils)/error-message'

export async function executeOAuthLoginRequest (provider: string): Promise<{ url: string }> {
  const url = await getOAuthLoginUrl(provider)
  if (url == null) {
    throw new Error(FAIL_TO_LOGIN_WITH_PROVIDER(provider))
  }
  return url
}
