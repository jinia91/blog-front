import { atom, useAtom } from 'jotai'
import { type Session } from '@/auth/application/domain/session'
import { oAuthLogin, oAuthLogout, refreshTokens } from '@/auth/infra/api/auth'
import type { Provider } from '@/auth/application/domain/provider'

const sessionAtom = atom<Session | null>(null)

export const useSession = (): {
  session: Session | null
  initializeSession: () => Promise<void>
  handleLogout: () => Promise<void>
  executeLoginWithCode: (provider: Provider, code: string) => Promise<void>
} => {
  const [session, setSession] = useAtom(sessionAtom)
  const initializeSession = async (): Promise<void> => {
    const refreshedSession = await refreshTokens()
    setSession(refreshedSession)
  }

  const updateSession = (newSession: Session | null): void => {
    setSession(newSession)
  }

  const handleLogout = async (): Promise<void> => {
    try {
      updateSession(null)
      await oAuthLogout()
    } catch (error) {
      console.error('Failed to logout:', error)
    }
  }

  const executeLoginWithCode = async (provider: Provider, code: string): Promise<void> => {
    const loginInfo = await oAuthLogin(provider, code)
    if (loginInfo == null) {
      throw new Error('loginInfo 가 없습니다')
    }
    updateSession({
      nickName: loginInfo.nickName,
      email: loginInfo.email,
      roles: loginInfo.roles,
      picUrl: loginInfo.picUrl
    })
  }

  return { session, initializeSession, handleLogout, executeLoginWithCode }
}
