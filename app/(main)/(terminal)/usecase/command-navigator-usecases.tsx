import { useAtom } from 'jotai'
import { terminalAtom } from './command-handle-usecases'

export const useCommandNavigate = (): {
  navigate: (direction: 'up' | 'down') => void
} => {
  const [context, setContext] = useAtom(terminalAtom)
  const navigate = (direction: 'up' | 'down'): void => {
    const historyLength = context.commandHistory.length
    if (historyLength === 0) return

    if (direction === 'up') {
      if (context.currentHistoryIndex === null) {
        setContext((prevContext) => ({
          ...prevContext,
          currentHistoryIndex: historyLength - 1,
          currentInput: prevContext.commandHistory[historyLength - 1]
        }))
      } else if (context.currentHistoryIndex > 0) {
        setContext((prevContext) => ({
          ...prevContext,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          currentHistoryIndex: prevContext.currentHistoryIndex! - 1,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          currentInput: prevContext.commandHistory[prevContext.currentHistoryIndex! - 1]
        }))
      }
    } else if (direction === 'down') {
      if (context.currentHistoryIndex !== null && context.currentHistoryIndex < historyLength - 1) {
        setContext((prevContext) => ({
          ...prevContext,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          currentHistoryIndex: prevContext.currentHistoryIndex! + 1,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          currentInput: prevContext.commandHistory[prevContext.currentHistoryIndex! + 1]
        }))
      } else {
        setContext((prevContext) => ({
          ...prevContext,
          currentHistoryIndex: null,
          currentInput: ''
        }))
      }
    }
  }
  return {
    navigate
  }
}
