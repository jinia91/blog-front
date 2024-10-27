import { commandParser } from '../domain/command'
import { useAtom } from 'jotai'
import { terminalAtom } from './terminal-atom'
import { clearCommand } from './clear-command'
import { welcomeCommand } from './welcome-command'
import { helpCommand } from './help-command'
import { historyCommand } from './history-command'
import { githubCommand } from './github-command'
import { COMMAND_LINE_DEFAULT } from '../domain/terminal-context'
import { curlCommand } from './curl-command'

export const useCommandHandle = (): {
  handleCommand: (username: string) => Promise<void>
} => {
  const COMMAND_LIST = [clearCommand, welcomeCommand, helpCommand, historyCommand, githubCommand, curlCommand]
  const [context, setContext] = useAtom(terminalAtom)
  const handleCommand = async (username: string): Promise<void> => {
    const command = context.currentInput
    const [commandName, args] = commandParser.parseCommand(command)
    preProcessCommand(command, username)
    await processCommand(commandName, args)
    processPostCommand()
  }

  function preProcessCommand (command: string, username: string): void {
    setContext((prevContext) => ({
      ...prevContext,
      commandHistory: command.trim() === '' ? prevContext.commandHistory : prevContext.commandHistory.concat(command),
      view: prevContext.view.concat(username + COMMAND_LINE_DEFAULT + ' ' + command),
      currentHistoryIndex: null,
      isProcessing: true
    }))
  }

  async function processCommand (commandLine: string, args: string[]): Promise<void> {
    if (commandLine.trim() === '') {
      return
    }
    const command = COMMAND_LIST.find((c) => c.name === commandLine)
    if (command === null || command === undefined) {
      setContext((prevContext: any) => ({
        ...prevContext,
        view: prevContext.view.concat(
          'jsh: 커맨드를 찾을수 없습니다: ' + commandLine
        )
      }))
    } else {
      await command.execute(setContext, args)
    }
  }

  function processPostCommand (): void {
    setContext((prevContext: any) => ({
      ...prevContext,
      currentInput: '',
      isProcessing: false
    }))
  }

  return {
    handleCommand
  }
}
