import { oAuthLogin } from '@/auth/adapter/outbound/api/auth'
import type { Session } from '@/auth/application/domain/Session'
import { type Provider } from '@/auth/application/domain/Provider'

interface LoginCommand {
  provider: Provider
  code: string
  setSession: (session: Session) => void
}

export async function executeLoginWithCode ({ provider, code, setSession }: LoginCommand): Promise<void> {
  const loginInfo = await oAuthLogin(provider, code)
  if (loginInfo == null) {
    throw new Error('loginInfo 가 없습니다')
  }
  const newSession: Session = {
    nickName: loginInfo.nickName,
    email: loginInfo.email,
    roles: loginInfo.roles,
    picUrl: loginInfo.picUrl
  }
  setSession(newSession)
}
