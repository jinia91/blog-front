'use client'
import { useSession } from '../(usecase)/session-usecases'
import React, { useEffect } from 'react'
import { useGlobalPending } from '../../(layout)/(usecase)/global-pending-usecases'

export const SessionProvider = ({ children }: { children: React.ReactNode }): React.ReactElement | null => {
  const { initializeSession } = useSession()
  const [mounted, setMounted] = React.useState(false)
  const { isGlobalPending } = useGlobalPending()
  useEffect(() => {
    initializeSession().then(() => {
      setMounted(true)
    }).catch(error => {
      setMounted(true)
      console.debug('세션 초기화 실패:', error)
    })
  }, [])
  return mounted && !isGlobalPending ? <>{children}</> : null
}
