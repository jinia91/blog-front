import { type Command } from '../domain/command'

const FORTUNES: string[] = [
  // 프로그래밍 명언
  '"Premature optimization is the root of all evil." - Donald Knuth',
  '"Talk is cheap. Show me the code." - Linus Torvalds',
  '"Any fool can write code that a computer can understand. Good programmers write code that humans can understand." - Martin Fowler',
  '"First, solve the problem. Then, write the code." - John Johnson',
  '"The best error message is the one that never shows up." - Thomas Fuchs',
  '"Code is like humor. When you have to explain it, it\'s bad." - Cory House',
  '"Simplicity is the soul of efficiency." - Austin Freeman',
  '"Make it work, make it right, make it fast." - Kent Beck',
  '"The most dangerous phrase in the language is, We\'ve always done it this way." - Grace Hopper',
  '"Programs must be written for people to read, and only incidentally for machines to execute." - Harold Abelson',
  '"Debugging is twice as hard as writing the code in the first place." - Brian Kernighan',
  '"The only way to learn a new programming language is by writing programs in it." - Dennis Ritchie',
  '"Measuring programming progress by lines of code is like measuring aircraft building progress by weight." - Bill Gates',
  '"The function of good software is to make the complex appear to be simple." - Grady Booch',
  '"Before software can be reusable it first has to be usable." - Ralph Johnson',
  '"In theory, there is no difference between theory and practice. But, in practice, there is." - Jan L. A. van de Snepscheut',
  '"Walking on water and developing software from a specification are easy if both are frozen." - Edward V. Berard',
  '"Java is to JavaScript what car is to carpet." - Chris Heilmann',
  '"Truth can only be found in one place: the code." - Robert C. Martin',
  '"Give a man a program, frustrate him for a day. Teach a man to program, frustrate him for a lifetime." - Muhammad Waseem',
  '"It works on my machine." - Every Developer',
  '"There are only two hard things in Computer Science: cache invalidation and naming things." - Phil Karlton',
  '"The best time to plant a tree was 20 years ago. The second best time is now." - Chinese Proverb',
  '"Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away." - Antoine de Saint-Exupery',
  '"A language that doesn\'t affect the way you think about programming is not worth knowing." - Alan Perlis',
  '"The computer was born to solve problems that did not exist before." - Bill Gates',
  '"Software is like entropy: it is difficult to grasp, weighs nothing, and obeys the Second Law of Thermodynamics; i.e., it always increases." - Norman Augustine',
  '"If debugging is the process of removing bugs, then programming must be the process of putting them in." - Edsger W. Dijkstra',
  '"Deleted code is debugged code." - Jeff Sickel',
  '"The best code is no code at all." - Jeff Atwood',
  // 재미있는 개발자 유머
  '"I don\'t always test my code, but when I do, I do it in production." - Most Dangerous Developer',
  '"99 little bugs in the code, 99 little bugs. Take one down, patch it around, 127 little bugs in the code."',
  '"Works on my machine. Ship it!" - Every CI/CD pipeline\'s nightmare',
  '"There are 10 types of people in the world: those who understand binary, and those who don\'t."',
  '"A SQL query walks into a bar, walks up to two tables and asks... Can I join you?"',
  '"Why do programmers prefer dark mode? Because light attracts bugs."',
  '"To understand recursion, you must first understand recursion."'
]

function getRandomFortune (): string {
  const index = Math.floor(Math.random() * FORTUNES.length)
  return FORTUNES[index]
}

function wrapText (text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    if (currentLine.length + word.length + 1 > maxWidth) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = currentLine === '' ? word : currentLine + ' ' + word
    }
  }

  if (currentLine !== '') {
    lines.push(currentLine)
  }

  return lines
}

function renderFortuneCookie (text: string): string[] {
  const maxWidth = 46
  const wrappedLines = wrapText(text, maxWidth)

  const output: string[] = []
  output.push('')
  output.push('  ,------------------------------------.')
  output.push(' / \\                                    \\')

  for (const line of wrappedLines) {
    output.push(` |   ${line.padEnd(maxWidth - 2)}  |`)
  }

  output.push(' |                                      |')
  output.push(' \\_/____________________________________/')

  return output
}

export const fortuneCommand: Command = {
  name: 'fortune',
  description: '랜덤 개발 명언 출력',
  category: 'fun',
  aliases: ['quote'],
  usage: 'fortune',
  execute: async (setContext): Promise<void> => {
    const fortune = getRandomFortune()
    const output = renderFortuneCookie(fortune)

    setContext((prev) => ({
      ...prev,
      view: [...prev.view, ...output]
    }))
  }
}
