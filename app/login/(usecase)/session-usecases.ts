import { atom, useAtom } from 'jotai'
import { type Session } from '../(domain)/session'
import { oAuthLogin, oAuthLogout, refreshTokens } from '../(infra)/auth'
import type { OAuthProvider } from '../(domain)/OAuthProvider'
import { FAIL_TO_LOGIN } from '../../(utils)/error-message'

const sessionAtom = atom<Session | null>(null)

export const useSession = (): {
  session: Session | null
  initializeSession: () => Promise<void>
  handleLogout: () => Promise<void>
  executeLoginWithCode: (provider: OAuthProvider, code: string) => Promise<void>
} => {
  const [session, setSession] = useAtom(sessionAtom)
  const initializeSession = async (): Promise<void> => {
    const refreshedSession = await refreshTokens()
    setSession(refreshedSession)
  }

  const handleLogout = async (): Promise<void> => {
    try {
      setSession(null)
      await oAuthLogout()
    } catch (error) {
      console.error('Failed to logout:', error)
    }
  }

  const executeLoginWithCode = async (provider: OAuthProvider, code: string): Promise<void> => {
    const loginInfo = await oAuthLogin(provider, code)
    if (loginInfo == null) {
      throw new Error(FAIL_TO_LOGIN)
    }
    setSession({
      nickName: loginInfo.nickName,
      email: loginInfo.email,
      roles: loginInfo.roles,
      picUrl: loginInfo.picUrl
    })
  }

  return { session, initializeSession, handleLogout, executeLoginWithCode }
}
