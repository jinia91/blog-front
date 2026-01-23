import { commandParser } from '../command'

describe('커맨드 명령어 파싱 테스트', () => {
  it('명령어를 파싱하여 커맨드와 인자로 분리한다', () => {
    // given
    const command = 'ls -al'
    // when
    const result = commandParser.parseCommand(command)
    // then
    expect(result.command).toBe('ls')
    expect(result.args).toEqual([])
    expect(result.flags).toEqual({ a: true, l: true })
  })

  it('플래그와 인자를 모두 파싱한다', () => {
    // given
    const command = 'curl -v --timeout 5000 https://example.com'
    // when
    const result = commandParser.parseCommand(command)
    // then
    expect(result.command).toBe('curl')
    expect(result.args).toEqual(['https://example.com'])
    expect(result.flags).toEqual({ v: true, timeout: '5000' })
  })

  it('긴 플래그를 = 기호로 파싱한다', () => {
    // given
    const command = 'git commit --message="Initial commit"'
    // when
    const result = commandParser.parseCommand(command)
    // then
    expect(result.command).toBe('git')
    expect(result.args).toEqual(['commit'])
    expect(result.flags).toEqual({ message: '"Initial' })
  })

  it('인자만 있는 명령어를 파싱한다', () => {
    // given
    const command = 'echo hello world'
    // when
    const result = commandParser.parseCommand(command)
    // then
    expect(result.command).toBe('echo')
    expect(result.args).toEqual(['hello', 'world'])
    expect(result.flags).toEqual({})
  })
})
