import { commandParser } from '../domain/command'
import { useAtom } from 'jotai'
import { terminalAtom } from './terminal-atom'
import { clearCommand } from './clear-command'
import { welcomeCommand } from './welcome-command'
import { helpCommand } from './help-command'
import { historyCommand } from './history-command'
import { githubCommand } from './github-command'

export const useCommandHandle = (): {
  handleCommand: (username: string) => void
} => {
  const COMMAND_LIST = [clearCommand, welcomeCommand, helpCommand, historyCommand, githubCommand]
  const [context, setContext] = useAtom(terminalAtom)
  const handleCommand = (username: string): void => {
    const command = context.currentInput
    const [commandName, args] = commandParser.parseCommand(command)
    preProcessCommand(commandName, args, username)
    processCommand(commandName, args, username)
    processPostCommand()
  }

  function preProcessCommand (commandLine: string, args: string[], username: string): void {
    setContext((prevContext) => ({
      ...prevContext,
      commandHistory: commandLine.trim() === '' ? prevContext.commandHistory : prevContext.commandHistory.concat(commandLine),
      view: prevContext.view.concat(username + '@jiniaslog:# ~ ' + commandLine),
      currentHistoryIndex: null
    }))
  }

  function processCommand (commandLine: string, args: string[], username: string): void {
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
      command.execute(context, setContext, args)
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
