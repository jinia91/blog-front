'use client'
'use strict'

import React, { useContext, useEffect } from 'react'
import { oAuthLogin } from '@/api/auth'
import { AuthSessionContext } from '@/components/auth/AuthSessionProvider'
import { useRouter } from 'next/navigation'
import { type Session } from '@/api/session'

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
      if (loginInfo == null) {
        throw new Error('No loginInfo')
      }

      const session: Session = {
        nickName: loginInfo.nickName,
        email: loginInfo.email,
        roles: loginInfo.roles,
        picUrl: loginInfo.picUrl
      }

      setSession(session)
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
