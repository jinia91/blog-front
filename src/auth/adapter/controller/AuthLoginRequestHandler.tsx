import { executeOAuthLoginRequest } from '@/auth/application/usecase/OAuthLoginRequestUseCase'

export async function handleAuthLoginRequest (provider: string): Promise<void> {
  const url = await executeOAuthLoginRequest(provider)
  if (url == null) {
    console.error('로그인에 실패했습니다: 서버 에러')
    return
  }
  window.location.href = url.url
}
