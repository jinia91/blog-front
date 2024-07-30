'use client'
import { useSession } from '@/auth/application/usecase/SessionUseCases'
import React, { useEffect } from 'react'
import { useGlobalPending } from '@/system/application/usecase/GlobalPendingUseCases'

export const SessionProvider = ({ children }: { children: React.ReactNode }): React.ReactElement | null => {
  const { initializeSession } = useSession()
  const [mounted, setMounted] = React.useState(false)
  const { isGlobalPending } = useGlobalPending()
  console.log('Session Provider 렌더링 횟수 체크')
  useEffect(() => {
    initializeSession().then(() => {
      setMounted(true)
    }).catch(error => {
      console.error('세션 초기화 실패:', error)
    })
  }, [])
  return mounted && !isGlobalPending ? <>{children}</> : null
}
