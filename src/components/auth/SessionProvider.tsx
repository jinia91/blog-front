'use client'
import { useSession } from '@/auth/application/usecase/SessionUseCases'
import React, { useEffect } from 'react'

export const SessionProvider = ({ children }: { children: React.ReactNode }): React.ReactElement | null => {
  const { initializeSession } = useSession()
  useEffect(() => {
    initializeSession().catch(error => {
      console.error('세션 초기화 실패:', error)
    })
  }, [])
  return <>{children}</>
}
