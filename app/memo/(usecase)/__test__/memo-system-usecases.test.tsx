import { act, renderHook } from '@testing-library/react'
import { useMemoSystem } from '../memo-system-usecases'
import React from 'react'
import { Provider } from 'jotai/index'
import { NavigatorContextType } from '../../(domain)/memo-system-navigator-context'

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => <Provider>{children}</Provider>

describe('메모시스템 레퍼런스 모드 토글 테스트', () => {
  it('레퍼런스 모드 토글 시 레퍼런스 모드가 활성화 되어야 한다.', () => {
    // given
    const { result } = renderHook(() => useMemoSystem(), { wrapper })
    // when
    act(() => {
      result.current.toggleReferenceMode()
    })
    // then
    expect(result.current.navigatorContext.type === NavigatorContextType.REFERENCE_MODE).toBe(true)
  })

  it('레퍼런스 모드 토글 시 레퍼런스 모드가 비활성화 되어야 한다.', () => {
    // given
    const { result } = renderHook(() => useMemoSystem(), { wrapper })
    act(() => {
      result.current.toggleReferenceMode()
    })
    expect(result.current.navigatorContext.type === NavigatorContextType.REFERENCE_MODE).toBe(true)

    // when
    act(() => {
      result.current.toggleReferenceMode()
    })
    // then
    expect(result.current.navigatorContext.type === NavigatorContextType.REFERENCE_MODE).toBe(false)
  })
  it('컨텍스트를 리프레시하면 카운트가 올라간다', () => {
    // given
    const { result } = renderHook(() => useMemoSystem(), { wrapper })
    act(() => {
      result.current.refreshReference()
    })
    expect(result.current.navigatorContext.refreshTrigger).toEqual(1)
    // when
    act(() => {
      result.current.refreshReference()
    })
    // then
    expect(result.current.navigatorContext.refreshTrigger).toEqual(2)
  })
})

describe('메모시스템 작업 컨텍스트 관리 테스트', () => {
  it('메모시스템 작업 컨텍스트를 설정할 수 있다.', () => {
    // given
    const { result } = renderHook(() => useMemoSystem(), { wrapper })
    // when
    act(() => {
      result.current.setMemoEditorSharedContext({ title: '메모시스템 작업 컨텍스트 테스트', id: '1' })
    })
    // then
    expect(result.current.memoEditorSharedContext.title).toBe('메모시스템 작업 컨텍스트 테스트')
    expect(result.current.memoEditorSharedContext.id).toBe('1')
  })

  it('메모시스템 작업 컨텍스트중 타이틀만 수정할 수 있다', () => {
    // given
    const { result } = renderHook(() => useMemoSystem(), { wrapper })
    // when
    act(() => {
      result.current.setMemoTitle('메모시스템 작업 컨텍스트 테스트')
    })
    // then
    expect(result.current.memoEditorSharedContext.title).toBe('메모시스템 작업 컨텍스트 테스트')
  })
})
