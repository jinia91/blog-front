import { Provider } from 'jotai'
import { act, renderHook } from '@testing-library/react'
import { useSideBar } from '../side-bar-usecases'
import React from 'react'

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => <Provider>{children}</Provider>

describe('사이드 바유스케이스 테스트', () => {
  it('사이드바 토글시 on이였다면 off로 바뀌어야한다', () => {
    // given
    const { result } = renderHook(() => useSideBar(), { wrapper })
    expect(result.current.isCollapsed).toBe(true)

    // when
    act(() => {
      result.current.toggleSideBarCollapse()
    })

    // then
    expect(result.current.isCollapsed).toBe(false)
  })

  it('사이드바 토글시 off였다면 on으로 바뀌어야한다', () => {
    // given
    const { result } = renderHook(() => useSideBar(), { wrapper })
    act(() => {
      result.current.toggleSideBarCollapse()
    })
    expect(result.current.isCollapsed).toBe(false)

    // when
    act(() => {
      result.current.toggleSideBarCollapse()
    })

    // then
    expect(result.current.isCollapsed).toBe(true)
  })
})
