import { type Mock, vi } from 'vitest'
import { OAuthProvider } from '../../(domain)/OAuthProvider'
import { executeOAuthLoginRequest } from '../oauth-login-usecases'
import { FAIL_TO_LOGIN_WITH_PROVIDER } from '../../../(utils)/error-message'

describe('oAuth 로그인 url 가져오기 테스트', () => {
  it('oAuth 로그인 url 가져오기 성공', async () => {
    // given
    const provider = OAuthProvider.GOOGLE
    global.fetch = vi.fn(() => ({
      ok: true,
      json: async () => ({ url: 'https://google.com' })
    })) as Mock

    // when
    const result = await executeOAuthLoginRequest(provider)

    // then
    expect(result).toEqual({ url: 'https://google.com' })
  })

  it('oAuth 로그인 url 가져오기 실패', async () => {
    // given
    const provider = OAuthProvider.GOOGLE
    global.fetch = vi.fn(() => ({
      ok: false,
      statusText: 'Internal Server Error'
    })) as Mock

    // when
    const result = executeOAuthLoginRequest(provider)

    // then
    await expect(result).rejects.toThrow(FAIL_TO_LOGIN_WITH_PROVIDER(provider))
  })
})
