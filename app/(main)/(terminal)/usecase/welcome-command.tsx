import { type Command } from '../domain/command'

export const logo = `
     .->    (\`-')  _                             <-. (\`-')   (\`-')  _    (\`-')
 (\`(\`-')/\`) ( OO).-/  <-.    _             .->      \\(OO )_  ( OO).-/    ( OO).->       .->
,-\`( OO).',(,------.,--. )   \\-,-----.(\`-')----. ,--./  ,-.)(,------.    /    '._  (\`-')----.
|  |\\  |  | |  .---'|  (\`-')  |  .--./( OO).-.  '|   \`.'   | |  .---'    |'--...__)( OO).-.  '
|  | '.|  |(|  '--. |  |OO ) /_) (\`-')( _) | |  ||  |'.'|  |(|  '--.     \`--.  .--'( _) | |  |
|  |.'.|  | |  .--'(|  '__ | ||  |OO ) \\|  |)|  ||  |   |  | |  .--'        |  |    \\|  |)|  |
|   ,'.   | |  \`---.|     |'(_'  '--'\\  '  '-'  '|  |   |  | |  \`---.       |  |     '  '-'  '
\`--'   '--' \`------'\`-----'    \`-----'   \`-----' \`--'   \`--' \`------'       \`--'      \`-----'
                                               _     <-. (\`-')_  _     (\`-')  _     (\`-').->                                      ,---.
                                              (_)       \\( OO) )(_)    (OO ).-/,--. ( OO)_         <-.        .->       .->       |   |
                                       <-.--. ,-(\`-'),--./ ,--/ ,-(\`-')/ ,---. \\  |(_)--\\_)      ,--. )  (\`-')----.  ,---(\`-')    |   |
                                     (\`-'| ,| | ( OO)|   \\ |  | | ( OO)| \\ /\`.\\ \`-'/    _ /      |  (\`-')( OO).-.  ''  .-(OO )    |   |
                                     (OO |(_| |  |  )|  . '|  |)|  |  )'-'|_.' |   \\_..\`--.      |  |OO )( _) | |  ||  | .-, \\    |  .'
                                    ,--. |  |(|  |_/ |  |\\    |(|  |_/(|  .-.  |   .-._)   \\    (|  '__ | \\|  |)|  ||  | '.(_/    \`--'
                                    |  '-'  / |  |'->|  | \\   | |  |'->|  | |  |   \\       /     |     |'  '  '-'  '|  '-'  |     .--.
                                     \`-----'  \`--'   \`--'  \`--' \`--'   \`--' \`--'    \`-----'      \`-----'    \`-----'  \`-----'      \`--'
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
