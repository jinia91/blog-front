import TabLink from '@/components/tapbar/TabLink'
import React, { useContext } from 'react'
import { AuthSessionContext } from '@/components/auth/AuthSessionProvider'

export default function SignInAndOutBox (): React.ReactElement {
  const { session, setSession } = useContext(AuthSessionContext)
  const handleLogout = async (): Promise<void> => {
    try {
      setSession(null)
    } catch (error) {
      console.error('Failed to logout:', error)
    }
  }
  return (
    session != null
      ? (
        <span>
            <span
            >{session.nickName} 님 </span><button
          onClick={() => {
            handleLogout().catch((err) => {
              console.error('Error:', err)
            })
          }}>로그아웃</button>
            </span>
        )
      : (<TabLink name={'로그인'} href={'/login'}>로그인</TabLink>)
  )
}
