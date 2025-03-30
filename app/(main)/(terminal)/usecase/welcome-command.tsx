import { type Command } from '../domain/command'

export const logo = `

   ___  _____  _   _  _____   ___
  |_  ||_   _|| \\ | ||_   _| / _ \\
    | |  | |  |  \\| |  | |  / /_\\ \\
    | |  | |  | . \` |  | |  |  _  |
/\\__/ / _| |_ | |\\  | _| |_ | | | |
\\____/  \\___/ \\_| \\_/ \\___/ \\_| |_/

's Log 에 오신 것을 환영합니다.

`

export const welcomeCommand: Command = {
  name: 'welcome',
  description: '프로그램을 시작할 때 화면에 보여질 로고를 불러옵니다',
  execute: async (setContext, args): Promise<void> => {
    setContext((prev) => ({
      ...prev,
      view: prev.view.concat(logo)
    }))
  }
}
