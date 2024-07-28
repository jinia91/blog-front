import { oAuthLogin } from '@/auth/adapter/outbound/api/auth'
import type { Session } from '@/auth/application/domain/Session'
import { type Provider } from '@/auth/application/domain/Provider'

interface LoginCommand {
  provider: Provider
  code: string
}

export async function executeLoginWithCode ({ provider, code }: LoginCommand): Promise<Session> {
  const loginInfo = await oAuthLogin(provider, code)
  if (loginInfo == null) {
    throw new Error('loginInfo 가 없습니다')
  }
  return {
    nickName: loginInfo.nickName,
    email: loginInfo.email,
    roles: loginInfo.roles,
    picUrl: loginInfo.picUrl
  }
}
