import { useContext, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { executeLoginWithCode } from '@/auth/application/usecase/LoginWithCodeUseCase'
import { AuthSessionContext } from '@/auth/adapter/provider/AuthSessionProvider'
import { findProvider } from '@/auth/application/domain/Provider'

export function useLoginWithCodeOfProvider (): void {
  const { session, setSession } = useContext(AuthSessionContext)
  const router = useRouter()
  useEffect(() => {
    async function handleLogin (): Promise<void> {
      const isAlreadyLogin = session !== null
      if (isAlreadyLogin) {
        router.push('/')
      } else {
        const url = new URL(window.location.href)
        const code = url.searchParams.get('code')
        const providerStr = url.pathname.split('/').pop()
        if (code == null) {
          throw new Error('잘못된 코드 url')
        }
        if (providerStr == null) {
          throw new Error('프로바이더가 없습니다')
        }
        const provider = findProvider(providerStr)
        await executeLoginWithCode({ provider, code, setSession })
        router.push('/')
      }
    }

    handleLogin().catch(error => {
      console.error('로그인 실패:', error)
    })
  }, [])
}
