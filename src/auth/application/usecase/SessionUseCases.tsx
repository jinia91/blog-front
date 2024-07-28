import { atom, useAtom } from 'jotai'
import { type Session } from '@/auth/application/domain/Session'
import {
  getSessionFromStorage,
  removeSessionFromStorage,
  saveSessionToStorage
} from '@/auth/adapter/outbound/localstorage/auth-localstorage'

const sessionUseCases = atom<Session | null>(null)

export const useSession = (): {
  session: Session | null
  initializeSession: () => void
  updateSession: (newSession: Session | null) => void
} => {
  const [session, setSession] = useAtom(sessionUseCases)

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

  return { session, initializeSession, updateSession }
}
