import { useContext, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { executeLoginWithCode } from '@/auth/application/usecase/LoginWithCodeUseCase'
import { AuthSessionContext } from '@/auth/adapter/provider/AuthSessionProvider'

export function useLoginWithCodeOfProvider (): void {
  const { session, setSession } = useContext(AuthSessionContext)
  const router = useRouter()
  useEffect(() => {
    async function handleLogin (): Promise<void> {
      const isAlreadyLogin = session !== null
      if (isAlreadyLogin) {
        router.push('/')
      } else {
        const code = new URL(window.location.href).searchParams.get('code')
        console.log(code)
        if (code == null) {
          throw new Error('잘못된 코드 url')
        }
        await executeLoginWithCode({ code, setSession })
        router.push('/')
      }
    }

    handleLogin().catch(error => {
      console.error('로그인 실패:', error)
    })
  }, [])
}
