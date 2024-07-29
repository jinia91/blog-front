'use client'
import { useSession } from '@/auth/application/usecase/SessionUseCases'
import React, { useEffect } from 'react'
import { useGlobalPending } from '@/system/application/usecase/GlobalPendingUseCases'
import { useTabs } from '@/system/application/usecase/TabUseCases'
import { usePathname } from 'next/navigation'

export const ContextInitializer = ({ children }: { children: React.ReactNode }): React.ReactElement | null => {
  const path = usePathname()
  const { initializeSession } = useSession()
  const { initializeTabs } = useTabs()
  const [mounted, setMounted] = React.useState(false)
  const { isGlobalPending } = useGlobalPending()
  useEffect(() => {
    initializeSession().then(() => {
      initializeTabs(path)
      setMounted(true)
    }).catch(error => {
      console.error('세션 초기화 실패:', error)
    })
  }, [])
  return mounted && !isGlobalPending ? <>{children}</> : null
}
