import { Provider } from 'jotai'
import { act, renderHook } from '@testing-library/react'
import React from 'react'
import { useContextMenu } from '../tab-context-menu-usecases'

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => <Provider>{children}</Provider>

describe('탭바 팝업 메뉴 유즈케이스 테스트', () => {
  it('팝업 메뉴를 닫을 수 있다', () => {
    // given
    const { result } = renderHook(() => useContextMenu(), { wrapper })

    // when
    act(() => {
      result.current.closeContextMenu()
    })

    // then
    expect(result.current.contextMenu).toBe(null)
  })

  it('팝업메뉴를 특정 좌표에서 열 수 있다', () => {
    // given
    const { result } = renderHook(() => useContextMenu(), { wrapper })

    // when
    act(() => {
      result.current.setContextMenu({ xPos: '100px', yPos: '100px', tabIdx: 0 })
    })

    // then
    expect(result.current.contextMenu).toEqual({ xPos: '100px', yPos: '100px', tabIdx: 0 })
  })
})
