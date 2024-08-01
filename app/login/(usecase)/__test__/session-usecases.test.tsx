import { type Mock, vi } from 'vitest'
import React from 'react'
import { useSession } from '../session-usecases'
import { act, renderHook } from '@testing-library/react'
import { OAuthProvider } from '../../(domain)/OAuthProvider'
import { Provider } from 'jotai'
import { FAIL_TO_LOGIN } from '../../../(utils)/error-message'

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => <Provider>{children}</Provider>

describe('세션 유스케이스 테스트', () => {
  it('유효한 리프레시토큰이 있다면 세션 초기화가 가능하다', async () => {
    // given
    global.fetch = vi.fn(() => ({
      ok: true,
      json: async () => ({
        nickName: 'test',
        email: 'test`',
        roles: new Set(['ADMIN']),
        picUrl: 'https://test.com'
      })
    })) as Mock

    // when
    const { result } = renderHook(() => useSession(), { wrapper })

    // then
    await act(async () => {
      await result.current.initializeSession()
    })

    expect(result.current.session).toEqual({
      nickName: 'test',
      email: 'test`',
      roles: new Set(['ADMIN']),
      picUrl: 'https://test.com'
    })
  })

  it('oauth 공급자의 코드가 주어지고 인증서버의 정상 응답이 오면 로그인이 가능하다', async () => {
    // given
    global.fetch = vi.fn(() => ({
      ok: true,
      json: async () => ({
        nickName: 'test',
        email: 'test`',
        roles: new Set(['ADMIN']),
        picUrl: 'https://test.com'
      })
    })) as Mock
    const { result } = renderHook(() => useSession(), { wrapper })

    // when
    await act(async () => {
      await result.current.executeLoginWithCode(OAuthProvider.GOOGLE, 'test')
    })

    // then
    expect(result.current.session).toEqual({
      nickName: 'test',
      email: 'test`',
      roles: new Set(['ADMIN']),
      picUrl: 'https://test.com'
    })
  })

  it('oauth 공급자의 코드가 주어지고 인증서버의 비정상 응답이 오면 세션정보가 저장되지 않는다', async () => {
    // given
    global.fetch = vi.fn(() => ({
      ok: false,
      statusText: 'Internal Server Error'
    })) as Mock

    const { result } = renderHook(() => useSession(), { wrapper })

    // when
    await act(async () => {
      await expect(result.current.executeLoginWithCode(OAuthProvider.GOOGLE, 'test')).rejects.toThrow(FAIL_TO_LOGIN)
    })

    // then
    expect(result.current.session).toBeNull()
  })

  it('로그아웃하면 세션이 없어진다', async () => {
    // given
    global.fetch = vi.fn(() => ({
      ok: true
    })) as Mock
    const { result } = renderHook(() => useSession(), { wrapper })

    // when
    await act(async () => {
      await result.current.handleLogout()
    })

    // then
    expect(result.current.session).toBeNull()
  })

  it('로그아웃시 서버에서 에러가 발생해도 세션정보는 없어진다', async () => {
    // given
    global.fetch = vi.fn(() => ({
      ok: false,
      statusText: 'Internal Server Error'
    })) as Mock
    const { result } = renderHook(() => useSession(), { wrapper })

    // when
    await act(async () => {
      await result.current.handleLogout()
    })

    // then
    expect(result.current.session).toBeNull()
  })
})
