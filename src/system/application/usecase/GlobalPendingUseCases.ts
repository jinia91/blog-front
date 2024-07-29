import { useAtom } from 'jotai/index'
import { GlobalPending } from '@/system/infra/atom/GlobalPendingAtom'

export const useGlobalPending = (): {
  isGlobalPending: boolean
  setGlobalPending: (value: boolean) => void
} => {
  const [isGlobalPending, setIsGlobalPending] = useAtom(GlobalPending)

  const setGlobalPending = (value: boolean): void => {
    setIsGlobalPending(value)
  }

  return { isGlobalPending, setGlobalPending }
}
