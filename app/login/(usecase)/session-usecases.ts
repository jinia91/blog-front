import { atom, useAtom } from 'jotai'
import { type Session } from '../(domain)/session'
import { oAuthLogin, oAuthLogout, refreshTokens } from '../(infra)/auth-api'
import type { OauthProvider } from '../(domain)/oauth-provider'
import { FAIL_TO_LOGIN, FAIL_TO_LOGOUT } from '../../(utils)/error-message'

const sessionAtom = atom<Session | null>(null)

export const useSession = (): {
  session: Session | null
  initializeSession: () => Promise<void>
  handleLogout: () => Promise<void>
  executeLoginWithCode: (provider: OauthProvider, code: string) => Promise<void>
} => {
  const [session, setSession] = useAtom(sessionAtom)
  const initializeSession = async (): Promise<void> => {
    const refreshedSession = await refreshTokens()
    setSession(refreshedSession)
  }

  const handleLogout = async (): Promise<void> => {
    setSession(null)
    const result = await oAuthLogout()
    if (!result) {
      console.error(FAIL_TO_LOGOUT)
    }
  }

  const executeLoginWithCode = async (provider: OauthProvider, code: string): Promise<void> => {
    const loginInfo = await oAuthLogin(provider, code)
    if (loginInfo === null) {
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
