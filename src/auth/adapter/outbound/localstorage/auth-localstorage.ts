import { type Session } from '@/auth/application/domain/Session'

export const saveSessionToStorage = (session: Session): void => {
  localStorage.setItem('session', JSON.stringify(session))
}

export const removeSessionFromStorage = (): void => {
  localStorage.removeItem('session')
}

export const getSessionFromStorage = (): Session | null => {
  const sessionData = localStorage.getItem('session')
  return (sessionData != null) ? JSON.parse(sessionData) : null
}
