import { atom, useAtom } from 'jotai/index'

const GlobalPending = atom(false)

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
