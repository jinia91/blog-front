import { useAtom } from 'jotai'
import { type Session } from '@/auth/application/domain/Session'
import { sessionAtom } from '@/auth/infra/atom/Session'
import { oAuthLogin, refreshTokens } from '@/auth/infra/api/Auth'
import type { Provider } from '@/auth/application/domain/Provider'

export const useSession = (): {
  session: Session | null
  initializeSession: () => Promise<void>
  updateSession: (newSession: Session | null) => void
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

  return { session, initializeSession, updateSession, handleLogout, executeLoginWithCode }
}
