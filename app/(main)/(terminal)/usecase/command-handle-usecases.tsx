import { COMMAND_LIST, commandParser } from '../domain/command'
import { atom, useAtom } from 'jotai'
import { COMMAND_LINE_DEFAULT, type TerminalContext } from '../domain/terminal-context'
import { logo } from './welcome-command'
import { saveHistory } from './terminal-persistence'

export const terminalAtom = atom<TerminalContext>({
  commandHistory: [],
  view: [logo],
  currentInput: '',
  currentHistoryIndex: null,
  processContext: null,
  isInitialLoad: false,
  theme: 'green',
  isBooting: false
})

export const useCommandHandle = (): {
  handleCommand: (username: string) => Promise<void>
} => {
  const [context, setContext] = useAtom(terminalAtom)
  const handleCommand = async (username: string): Promise<void> => {
    const command = context.currentInput
    const { command: commandName, args, flags } = commandParser.parseCommand(command)
    preProcessCommand(command, username)
    await processCommand(commandName, args, flags)
    processPostCommand()
  }

  function preProcessCommand (command: string, username: string): void {
    setContext((prevContext) => {
      const newHistory = command.trim() === '' ? prevContext.commandHistory : prevContext.commandHistory.concat(command)
      saveHistory(newHistory)
      return {
        ...prevContext,
        commandHistory: newHistory,
        view: prevContext.view.concat(username + COMMAND_LINE_DEFAULT + ' ' + command),
        currentHistoryIndex: null
      }
    })
  }

  async function processCommand (commandLine: string, args: string[], flags: Record<string, string | boolean>): Promise<void> {
    if (commandLine.trim() === '') {
      return
    }
    const command = COMMAND_LIST.find((c) => c.name === commandLine)
    if (command === null || command === undefined) {
      setContext((prevContext) => ({
        ...prevContext,
        view: prevContext.view.concat(
          'jsh: 커맨드를 찾을수 없습니다: ' + commandLine
        )
      }))
    } else {
      await command.execute(setContext, args, flags)
    }
  }

  function processPostCommand (): void {
    setContext((prevContext) => ({
      ...prevContext,
      currentInput: ''
    }))
  }

  return {
    handleCommand
  }
}
