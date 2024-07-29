import { atom } from 'jotai/index'
import type { Session } from '@/auth/application/domain/Session'

export const sessionAtom = atom<Session | null>(null)
