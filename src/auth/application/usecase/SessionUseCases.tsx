import { useAtom } from 'jotai'
import { type Session } from '@/auth/application/domain/Session'
import {
  getSessionFromStorage,
  removeSessionFromStorage,
  saveSessionToStorage
} from '@/auth/infra/localstorage/AuthLocalstorage'
import { sessionAtom } from '@/auth/infra/atom/Session'

export const useSession = (): {
  session: Session | null
  initializeSession: () => void
  updateSession: (newSession: Session | null) => void
  handleLogout: () => Promise<void>
} => {
  const [session, setSession] = useAtom(sessionAtom)

  const initializeSession = (): void => {
    const storedSession = getSessionFromStorage()
    if (storedSession != null) {
      setSession(storedSession)
    }
  }

  const updateSession = (newSession: Session | null): void => {
    if (newSession !== null) {
      saveSessionToStorage(newSession)
    } else {
      removeSessionFromStorage()
    }
    setSession(newSession)
  }

  const handleLogout = async (): Promise<void> => {
    try {
      updateSession(null)
    } catch (error) {
      console.error('Failed to logout:', error)
    }
  }

  return { session, initializeSession, updateSession, handleLogout }
}
