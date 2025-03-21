import { type Mock, vi } from 'vitest'
import { withAuthRetry } from '../auth-api'
import { HOST } from '../../../(utils)/constants'

describe('재로그인 데코레이터 테스트', () => {
  it('콜백 요청이 401 에러가 발생하면 템플릿으로 로그인을 시도한다', async () => {
    // given
    const callback = async (): Promise<Response> => {
      return await fetch(HOST + '/test', {
        method: 'POST',
        credentials: 'include'
      })
    }
    let count = 0
    const callBackResponse = { ok: false, status: 401 }
    const unUsedSessionInfo = {
      nickName: 'test',
      email: 'test`',
      roles: new Set(['ADMIN']),
      picUrl: 'https://test.com'
    }
    const authRetryResponse = {
      ok: true,
      json: async () => unUsedSessionInfo
    }
    const finalResponse = { ok: true, json: async () => ({}) }
    global.fetch = vi.fn(() => {
      count++
      if (count === 1) {
        return callBackResponse
      } else if (count === 2) {
        return authRetryResponse
      } else {
        return finalResponse
      }
    }) as Mock

    // when
    const result = await withAuthRetry(callback)

    // then
    expect(result).toEqual(finalResponse)
    expect(count).toBe(3)

    // for coverage
    expect(unUsedSessionInfo).toEqual(unUsedSessionInfo)
  })

  it('콜백요청 401이 발생하고 로그인 시도시 실패하면 401이된다', async () => {
    // given
    const callback = async (): Promise<Response> => {
      return await fetch(HOST + '/test', {
        method: 'POST',
        credentials: 'include'
      })
    }
    let isCallback = true
    const callBackResponse = { ok: false, status: 401 }
    const authRetryResponse = { ok: false }
    global.fetch = vi.fn(() => {
      if (isCallback) {
        isCallback = false
        return callBackResponse
      } else {
        return authRetryResponse
      }
    }) as Mock

    // when, then
    await expect(withAuthRetry(callback)).resolves.toEqual({ ok: false, status: 401 })
  })

  it('콜백 요청이 성공하면 템플릿요청은 동작하지 않고 콜백 응답만 수행한다', async () => {
    // given
    const callback = async (): Promise<Response> => {
      return await fetch(HOST + '/test', {
        method: 'POST',
        credentials: 'include'
      })
    }
    const callBackResponse = { ok: true }
    global.fetch = vi.fn(() => callBackResponse) as Mock

    // when
    const result = withAuthRetry(callback)

    // then
    await expect(result).resolves.toEqual(callBackResponse)
  })
})
