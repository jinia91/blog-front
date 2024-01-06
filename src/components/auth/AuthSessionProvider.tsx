import React, { useEffect, useState } from 'react'
import { type Session } from '@/api/session'

const initialStatus = {
  session: null,
  setSession: () => {
  }
}

export const AuthSessionContext = React.createContext<any>(initialStatus)

export function AuthSessionProvider ({ children }: { children: React.ReactNode }): React.ReactElement {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    const storedSession = localStorage.getItem('session')
    if (storedSession != null) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      setSession(JSON.parse(storedSession))
    }
  }, [])

  useEffect(() => {
    if (session != null) {
      localStorage.setItem('session', JSON.stringify(session))
    } else {
      localStorage.removeItem('session')
    }
  }, [session])

  return (
    <AuthSessionContext.Provider value={{ session, setSession }}>
      {children}
    </AuthSessionContext.Provider>
  )
}
