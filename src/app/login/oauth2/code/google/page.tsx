'use client'
import React, { useContext, useEffect } from 'react'
import { oAuthLogin } from '@/api/auth'
import { AuthSessionContext } from '@/components/auth/AuthSessionProvider'
import { useRouter } from 'next/navigation'

export default function Page (): React.ReactElement {
  const { session, setSession } = useContext(AuthSessionContext)
  const router = useRouter()
  const handleLogin = async (): Promise<void> => {
    if (session != null) {
      router.push('/')
    } else {
      const code = new URL(window.location.href).searchParams.get('code')
      if (code == null) {
        throw new Error('No code in url')
      }
      const loginInfo = await oAuthLogin('GOOGLE', code)
      setSession(loginInfo)
      router.push('/')
    }
  }

  useEffect(() => {
    void handleLogin()
  }, [])
  return (
    <></>
  )
}
