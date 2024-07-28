import { executeOAuthLoginRequest } from '@/auth/application/usecase/OAuthLoginRequestUseCase'

export async function handleAuthLoginRequest (provider: string): Promise<void> {
  const url = await executeOAuthLoginRequest(provider)
  if (url == null) {
    console.error('로그인 리다이렉트 URL이 없습니다.')
    return
  }
  window.location.href = url.url
}
