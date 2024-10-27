import { commandParser } from '../command'

describe('커맨드 명령어 파싱 테스트', () => {
  it('명령어를 파싱하여 커맨드와 인자로 분리한다', () => {
    // given
    const command = 'ls -al'
    // when
    const [parsedCommand, args] = commandParser.parseCommand(command)
    // then
    expect(parsedCommand).toBe('ls')
    expect(args).toEqual(['-al'])
  })
})
