'use client'
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '../../../(usecase)/session-usecases'
import { OAuthProvider } from '../../../(domain)/OAuthProvider'
import { useGlobalPending } from '../../../../(layout)/(usecase)/global-pending-usecases'

export default function Page (): React.ReactElement {
  const router = useRouter()
  const { session, executeLoginWithCode } = useSession()
  const { setGlobalPending } = useGlobalPending()
  useEffect(() => {
    async function handleLogin (): Promise<void> {
      const isAlreadyLogin = session !== null
      if (isAlreadyLogin) {
        console.log('이미 로그인 되어있음')
        router.push('/')
      } else {
        setGlobalPending(true)
        const url = new URL(window.location.href)
        const code = url.searchParams.get('code')
        if (code == null) {
          throw new Error('잘못된 코드 url')
        }
        const providerStr = url.pathname.split('/').pop()
        if (providerStr == null) {
          throw new Error('프로바이더가 없습니다')
        }
        const provider = OAuthProvider[providerStr.toUpperCase() as keyof typeof OAuthProvider]
        await executeLoginWithCode(provider, code).finally(() => {
          setGlobalPending(false)
        })
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
