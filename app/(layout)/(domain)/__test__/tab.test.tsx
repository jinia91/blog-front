import { describe, expect, it } from 'vitest'

import { EMPTY_PATH, LOGIN_PATH } from '../../../(utils)/constants'
import { type Tab, TabBarManager } from '../tab'

describe('경로 -> 탭 재생성 테스트', () => {
  it('로그인 경로가 주어지고 탭이 없다면 재생성된 탭은 메인탭을 가리켜야한다', () => {
    // given
    const path = LOGIN_PATH
    const tabs = [] as Tab[]
    const selectedTabIndex = 0
    const tabBarState = { tabs, selectedTabIndex }

    // when
    const result = TabBarManager.rebuildWithPath(tabBarState, path)

    // then
    expect(result).toEqual({ tabs: [{ name: '/', urlPath: '/' }], selectedTabIndex: 0 })
  })

  it('로그인 경로가 주어지고 탭이 있다면 재생성된 탭은 가장 최신탭을 가리켜야한다', () => {
    // given
    const path = LOGIN_PATH
    const tabs = [{ name: '메인', urlPath: '/' }]
    const selectedTabIndex = 0
    const tabBarState = { tabs, selectedTabIndex }

    // when
    const result = TabBarManager.rebuildWithPath(tabBarState, path)

    // then
    expect(result).toEqual({ tabs: [{ name: '메인', urlPath: '/' }], selectedTabIndex: 0 })
  })

  it('빈 경로가 주어지고 탭이 없으면 비어야한다', () => {
    // given
    const path = EMPTY_PATH
    const tabs = [] as Tab[]
    const selectedTabIndex = 0
    const tabBarState = { tabs, selectedTabIndex }

    // when
    const result = TabBarManager.rebuildWithPath(tabBarState, path)

    // then
    expect(result).toEqual({ tabs: [], selectedTabIndex: 0 })
  })

  it('빈 경로가 주어지고 탭이 있어도 비어야한다', () => {
    // given
    const path = EMPTY_PATH
    const tabs = [{ name: '메인', urlPath: '/' }]
    const selectedTabIndex = 0
    const tabBarState = { tabs, selectedTabIndex }

    // when
    const result = TabBarManager.rebuildWithPath(tabBarState, path)

    // then
    expect(result).toEqual({ tabs: [], selectedTabIndex: 0 })
  })

  it('특정 경로가 주어지고 빈탭이면 주어진 특정 경로탭을 만들어 가리켜야한다', () => {
    // given
    const path = '/'
    const tabs = [] as Tab[]
    const selectedTabIndex = 0
    const tabBarState = { tabs, selectedTabIndex }

    // when
    const result = TabBarManager.rebuildWithPath(tabBarState, path)

    // then
    expect(result).toEqual({ tabs: [{ name: '/', urlPath: '/' }], selectedTabIndex: 0 })
  })

  it('특정 경로가 주어지고 해당 경로가 탭에 없으면 주어진 특정 경로탭을 최신탭으로 만들어 가리켜야한다', () => {
    // given
    const path = '/'
    const tabs = [{ name: '/1', urlPath: '/1' }]
    const selectedTabIndex = 0
    const tabBarState = { tabs, selectedTabIndex }

    // when
    const result = TabBarManager.rebuildWithPath(tabBarState, path)

    // then
    expect(result.tabs.length).toBe(2)
    expect(result.tabs[1]).toEqual({ name: '/', urlPath: '/' })
  })

  it('특정 경로가 주어지고 해당 경로가 탭에 있으면 그 특정탭을 가리켜야한다', () => {
    // given
    const path = '/'
    const tabs = [{ name: '/', urlPath: '/' }]
    const selectedTabIndex = 0
    const tabBarState = { tabs, selectedTabIndex }

    // when
    const result = TabBarManager.rebuildWithPath(tabBarState, path)

    // then
    expect(result).toEqual({ tabs: [{ name: '/', urlPath: '/' }], selectedTabIndex: 0 })
  })
})

describe('탭 제거 테스트', () => {
  it('탭이 여러개 있을때 선택된 탭을 제거하면 제거되고 왼쪽 탭이 선택된다', () => {
    // given
    const tabs = [{ name: '메인', urlPath: '/' }, { name: '로그인', urlPath: '/login' }, { name: '회원가입', urlPath: '/signup' }]
    const selectedTabIndex = 1
    const tabBarState = { tabs, selectedTabIndex }

    // when
    const result = TabBarManager.removeTargetTabAndSelectNear(tabBarState, selectedTabIndex)
    // then
    expect(result).toEqual({
      tabs: [{ name: '메인', urlPath: '/' }, { name: '회원가입', urlPath: '/signup' }],
      selectedTabIndex: 0
    })
  })

  it('탭이 두개고 왼쪽탭이 선택되었을때, 왼쪽탭을 제거하면 오른쪽탭이 선택된다', () => {
    // given
    const tabs = [{ name: '메인', urlPath: '/' }, { name: '로그인', urlPath: '/login' }]
    const selectedTabIndex = 0
    const tabBarState = { tabs, selectedTabIndex }

    // when
    const result = TabBarManager.removeTargetTabAndSelectNear(tabBarState, selectedTabIndex)
    // then
    expect(result).toEqual({
      tabs: [{ name: '로그인', urlPath: '/login' }],
      selectedTabIndex: 0
    })
  })

  it('탭이 여러개고 선택된 탭보다 왼쪽 탭이 제거되면 선택된 탭은 계속된다', () => {
    // given
    const tabs = [{ name: '메인', urlPath: '/' }, { name: '로그인', urlPath: '/login' }, { name: '회원가입', urlPath: '/signup' }]
    const selectedTabIndex = 2

    // when
    const result = TabBarManager.removeTargetTabAndSelectNear({ tabs, selectedTabIndex }, selectedTabIndex - 1)
    // then
    expect(result).toEqual({
      tabs: [{ name: '메인', urlPath: '/' }, { name: '회원가입', urlPath: '/signup' }],
      selectedTabIndex: 1
    })
  })

  it('탭이 여러개고 선택된 탭보다 오른쪽 탭이 제거되면 선택된 탭은 계속된다', () => {
    // given
    const tabs = [{ name: '메인', urlPath: '/' }, { name: '로그인', urlPath: '/login' }, { name: '회원가입', urlPath: '/signup' }]
    const selectedTabIndex = 0

    // when
    const result = TabBarManager.removeTargetTabAndSelectNear({ tabs, selectedTabIndex }, selectedTabIndex + 1)
    // then
    expect(result).toEqual({
      tabs: [{ name: '메인', urlPath: '/' }, { name: '회원가입', urlPath: '/signup' }],
      selectedTabIndex: 0
    })
  })
})

describe('탭 이동 테스트', () => {
  it('탭바에서 선택된 탭을 원하는 위치로 이동시킬 수 있다', () => {
    // given
    const tabs = [{ name: '메인', urlPath: '/' }, { name: '로그인', urlPath: '/login' }, { name: '회원가입', urlPath: '/signup' }]
    const selectedTabIndex = 1
    const tabBarState = { tabs, selectedTabIndex }

    // when
    const result = TabBarManager.moveSelectedTabTo(tabBarState, 0)

    // then
    expect(result).toEqual({
      tabs: [{ name: '로그인', urlPath: '/login' }, { name: '메인', urlPath: '/' }, { name: '회원가입', urlPath: '/signup' }],
      selectedTabIndex: 0
    })
  })
})
