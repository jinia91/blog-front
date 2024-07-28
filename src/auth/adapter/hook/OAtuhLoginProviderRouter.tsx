import { useContext, useEffect } from 'react'
import { oAuthLogin } from '@/auth/adapter/api/auth'
import { AuthSessionContext } from '@/auth/application/AuthSessionProvider'
import { useRouter } from 'next/navigation'
import { type Session } from '@/outbound/api/session'

export function useLogin (): void {
  const { session, setSession } = useContext(AuthSessionContext)
  const router = useRouter()

  useEffect(() => {
    async function handleLogin (): Promise<void> {
      if (session !== null) {
        router.push('/')
      } else {
        const code = new URL(window.location.href).searchParams.get('code')
        if (code == null) {
          throw new Error('No code in url')
        }
        const loginInfo = await oAuthLogin('GOOGLE', code)
        if (loginInfo == null) {
          throw new Error('No loginInfo')
        }
        const newSession: Session = {
          nickName: loginInfo.nickName,
          email: loginInfo.email,
          roles: loginInfo.roles,
          picUrl: loginInfo.picUrl
        }
        setSession(newSession)
        router.push('/')
      }
    }

    handleLogin().catch(error => {
      console.error('Login failed:', error)
    })
  }, [])
}
