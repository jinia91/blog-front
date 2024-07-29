'use client'
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/auth/application/usecase/SessionUseCases'
import { Provider } from '@/auth/application/domain/Provider'

export default function Page (): React.ReactElement {
  const router = useRouter()
  const { session, executeLoginWithCode } = useSession()
  useEffect(() => {
    async function handleLogin (): Promise<void> {
      const isAlreadyLogin = session !== null
      if (isAlreadyLogin) {
        console.log('이미 로그인 되어 있습니다')
        router.push('/')
      } else {
        const url = new URL(window.location.href)
        const code = url.searchParams.get('code')
        if (code == null) {
          throw new Error('잘못된 코드 url')
        }
        const providerStr = url.pathname.split('/').pop()
        if (providerStr == null) {
          throw new Error('프로바이더가 없습니다')
        }
        const provider = Provider[providerStr.toUpperCase() as keyof typeof Provider]
        await executeLoginWithCode(provider, code)
        console.log('로그인 중입니다')
        router.push('/')
      }
    }

    handleLogin().catch(error => {
      console.error('로그인 실패:', error)
    })
  }, [])
  return (
    <></>
  )
}
