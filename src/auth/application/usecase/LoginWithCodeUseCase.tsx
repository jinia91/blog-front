import { oAuthLogin } from '@/auth/adapter/outbound/api/auth'
import type { Session } from '@/auth/application/domain/Session'

interface UteLoginWithCode {
  code: string
  setSession: (session: Session) => void
}

export async function executeLoginWithCode ({ code, setSession }: UteLoginWithCode): Promise<void> {
  const loginInfo = await oAuthLogin('GOOGLE', code)
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
