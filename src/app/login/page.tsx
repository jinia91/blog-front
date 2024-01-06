'use client'
import React, { useContext } from 'react'
import { getOAuthLoginUrl } from '@/api/auth'
import { AuthSessionContext } from '@/components/auth/AuthSessionProvider'

export default function Page (): React.ReactElement {
  const { session, setSession } = useContext(AuthSessionContext)

  const handleLogin = async (): Promise<void> => {
    try {
      const url = await getOAuthLoginUrl('GOOGLE')
      if (url == null) {
        throw new Error('No url')
      }
      window.location.href = url.url
    } catch (error) {
      console.error('Failed to login:', error)
    }
  }

  return (
    <div>
      {
        session != null
          ? <div>
            <p>Welcome, {session.nickName}!</p>
            <button
              onClick={() => {
                setSession(null)
              }}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
              Logout
            </button>
          </div>
          : <button
            onClick={() => {
              handleLogin().catch((err) => {
                console.error('Error:', err)
              })
            }}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Google Login
          </button>
      }
    </div>
  )
}
