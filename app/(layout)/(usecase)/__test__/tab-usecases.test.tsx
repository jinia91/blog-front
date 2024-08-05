import { Provider } from 'jotai'
import { act, renderHook } from '@testing-library/react'
import React from 'react'
import { useTabBarAndRouter } from '../tab-usecases'
import MockRouter from 'next-router-mock'

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => <Provider>{children}</Provider>

function setDefaultTabBarAtLocalStorage (): void {
  const initTabs = [{ name: '/test', urlPath: '/test' }, { name: '/test2', urlPath: '/test2' }]
  localStorage.setItem('tabs', JSON.stringify(initTabs))
  localStorage.setItem('selectedTabIdx', '0')
}

describe('탭 초기화 유즈케이스 테스트', () => {
  it('기존 탭바 상태가 없고 일반 경로가 주어지면 해당 경로로 라우팅되고 탭이 초기화되야한다', () => {
    // given
    const path = '/test'
    const { result } = renderHook(() => useTabBarAndRouter(), { wrapper })

    // when
    act(() => {
      result.current.initializeTabBar(path)
    })

    // then
    expect(result.current.tabs).toEqual([{ name: path, urlPath: path }])
    expect(result.current.selectedTabIdx).toBe(0)
    expect(MockRouter.pathname).toBe(path)
  })

  it('기존 탭바가 존재하고 일반 경로가 주어지면 해당 경로로 라우팅되고 탭이 초기화되야한다', () => {
    // given
    const path = '/1'
    const { result } = renderHook(() => useTabBarAndRouter(), { wrapper })
    localStorage.setItem('tabs', JSON.stringify([{ name: '/test', urlPath: '/test' }]))
    localStorage.setItem('selectedTabIdx', '0')

    // when
    act(() => {
      result.current.initializeTabBar(path)
    })

    // then
    expect(result.current.tabs).toEqual([{ name: '/test', urlPath: '/test' }, { name: path, urlPath: path }])
    expect(result.current.selectedTabIdx).toBe(1)
    expect(MockRouter.pathname).toBe(path)
  })

  it('기존 탭바가 존재하고 EMPTY 경로가 주어지면 모든 탭이 비어지고 empty 페이지로 이동한다', () => {
    // given
    const path = '/empty'
    const { result } = renderHook(() => useTabBarAndRouter(), { wrapper })
    localStorage.setItem('tabs', JSON.stringify([{ name: '/test', urlPath: '/test' }]))
    localStorage.setItem('selectedTabIdx', '0')

    // when
    act(() => {
      result.current.initializeTabBar(path)
    })

    // then
    expect(result.current.tabs).toEqual([])
    expect(result.current.selectedTabIdx).toBe(0)
    expect(MockRouter.pathname).toBe(path)
  })
})

describe('탭 선택 유즈케이스 테스트', () => {
  it('탭을 선택하면 해당 탭이 선택되고 라우팅된다', () => {
    // given
    const path = '/test'
    const { result } = renderHook(() => useTabBarAndRouter(), { wrapper })
    act(() => {
      result.current.initializeTabBar(path)
    })

    // when
    act(() => {
      result.current.selectTab(0)
    })

    // then
    expect(result.current.selectedTabIdx).toBe(0)
    expect(MockRouter.pathname).toBe(path)
  })
})

describe('탭 제거 유즈케이스 테스트', () => {
  it('탭제거 요청이 있으면 해당 탭이 제거되고 남은 탭으로 라우팅된다', () => {
    // given
    setDefaultTabBarAtLocalStorage()
    const path = '/test'
    const { result } = renderHook(() => useTabBarAndRouter(), { wrapper })
    act(() => {
      result.current.initializeTabBar(path)
    })

    // when
    act(() => {
      result.current.closeTab(0)
    })

    // then
    expect(result.current.tabs).toEqual([{ name: '/test2', urlPath: '/test2' }])
    expect(result.current.selectedTabIdx).toBe(0)
    expect(MockRouter.pathname).toBe('/test2')
  })
})

describe('탭 이동 유즈케이스 테스트', () => {
  it('선택된 탭을 특정 순서로 이동시키면 해당 탭이 이동된다', () => {
    // given
    setDefaultTabBarAtLocalStorage()
    const path = '/test'
    const { result } = renderHook(() => useTabBarAndRouter(), { wrapper })
    act(() => {
      result.current.initializeTabBar(path)
    })

    // when
    act(() => {
      result.current.moveSelectedTabTo(1)
    })

    // then
    expect(result.current.tabs).toEqual([{ name: '/test2', urlPath: '/test2' }, { name: '/test', urlPath: '/test' }])
    expect(result.current.selectedTabIdx).toBe(1)
  })
})

describe('탭 upsert 유즈케이스 테스트', () => {
  it('기존에 없는 탭 추가 요청이 있으면 탭이 추가되고 해당탭이 선택되며 이동한다', () => {
    // given
    setDefaultTabBarAtLocalStorage()
    const path = '/test'
    const { result } = renderHook(() => useTabBarAndRouter(), { wrapper })
    act(() => {
      result.current.initializeTabBar(path)
    })

    // when
    act(() => {
      result.current.upsertAndSelectTab({ name: '/test3', urlPath: '/test3' })
    })

    // then
    expect(result.current.tabs).toEqual([
      { name: '/test', urlPath: '/test' },
      { name: '/test2', urlPath: '/test2' },
      { name: '/test3', urlPath: '/test3' }
    ])
    expect(result.current.selectedTabIdx).toBe(2)
    expect(MockRouter.pathname).toBe('/test3')
  })

  it('기존에 있는 탭 추가 요청이 있으면 해당탭이 선택되며 이동한다', () => {
    // given
    setDefaultTabBarAtLocalStorage()
    const path = '/test'
    const { result } = renderHook(() => useTabBarAndRouter(), { wrapper })
    act(() => {
      result.current.initializeTabBar(path)
    })

    // when
    act(() => {
      result.current.upsertAndSelectTab({ name: '/test2', urlPath: '/test2' })
    })

    // then
    expect(result.current.tabs).toEqual([{ name: '/test', urlPath: '/test' }, { name: '/test2', urlPath: '/test2' }])
    expect(result.current.selectedTabIdx).toBe(1)
    expect(MockRouter.pathname).toBe('/test2')
  })
})

describe('탭 전체 제거 유즈케이스 테스트', () => {
  it('모든 탭을 제거하면 탭이 초기화되고 empty 페이지로 이동한다', () => {
    // given
    setDefaultTabBarAtLocalStorage()
    const path = '/test'
    const { result } = renderHook(() => useTabBarAndRouter(), { wrapper })
    act(() => {
      result.current.initializeTabBar(path)
    })

    // when
    act(() => {
      result.current.closeAllTabs()
    })

    // then
    expect(result.current.tabs).toEqual([])
    expect(result.current.selectedTabIdx).toBe(0)
    expect(MockRouter.pathname).toBe('/empty')
  })
})

describe('탭 제거 without 유즈케이스 테스트', () => {
  it('특정 탭을 제외하고 모두 제거하면 해당 탭만 남고 선택되며 이동한다', () => {
    // given
    setDefaultTabBarAtLocalStorage()
    const path = '/test'
    const { result } = renderHook(() => useTabBarAndRouter(), { wrapper })
    act(() => {
      result.current.initializeTabBar(path)
    })

    // when
    act(() => {
      result.current.closeOtherTabsWithOut(0)
    })

    // then
    expect(result.current.tabs).toEqual([{ name: '/test', urlPath: '/test' }])
    expect(result.current.selectedTabIdx).toBe(0)
    expect(MockRouter.pathname).toBe('/test')
  })
})

describe('탭바 교체 유즈케이스 테스트', () => {
  it('탭바를 교체하면 모든 탭이 교체되고 요청한 탭으로 선택되며 라우팅된다', () => {
    // given
    setDefaultTabBarAtLocalStorage()
    const path = '/test'
    const { result } = renderHook(() => useTabBarAndRouter(), { wrapper })
    act(() => {
      result.current.initializeTabBar(path)
    })

    // when
    act(() => {
      result.current.updateTabBar([{ name: '/test3', urlPath: '/test3' }], 0)
    })

    // then
    expect(result.current.tabs).toEqual([{ name: '/test3', urlPath: '/test3' }])
    expect(result.current.selectedTabIdx).toBe(0)
    expect(MockRouter.pathname).toBe('/test3')
  })
})
