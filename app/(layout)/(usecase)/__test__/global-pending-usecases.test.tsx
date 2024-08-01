import { Provider } from 'jotai'
import { act, renderHook } from '@testing-library/react'
import React from 'react'
import { useGlobalPending } from '../global-pending-usecases'

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => <Provider>{children}</Provider>

describe('글로벌 펜딩 유스케이스 테스트', () => {
  it('글로벌 펜딩값을 설정할 수 있다', () => {
    // given
    const { result } = renderHook(() => useGlobalPending(), { wrapper })
    expect(result.current.isGlobalPending).toBe(false)

    // when
    act(() => {
      result.current.setGlobalPending(true)
    })

    // then
    expect(result.current.isGlobalPending).toBe(true)
  })
})
