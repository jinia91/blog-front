import { describe, expect, it } from 'vitest'
import { rebuildTabsWithPath, type Tab } from '../tab'
import { EMPTY_PATH, LOGIN_PATH } from '../../../(utils)/constants'

describe('경로 -> 탭 재생성 테스트', () => {
  it('로그인 경로가 주어지고 탭이 없다면 재생성된 탭은 메인탭을 가리켜야한다', () => {
    // given
    const path = LOGIN_PATH
    const tabs = [] as Tab[]
    const selectedTabIndex = 0

    // when
    const result = rebuildTabsWithPath(path, tabs, selectedTabIndex)

    // then
    expect(result).toEqual({ updatedTabs: [{ name: '/', urlPath: '/' }], updatedSelectedTabIndex: 0 })
  })

  it('로그인 경로가 주어지고 탭이 있다면 재생성된 탭은 가장 최신탭을 가리켜야한다', () => {
    // given
    const path = LOGIN_PATH
    const tabs = [{ name: '메인', urlPath: '/' }]
    const selectedTabIndex = 0

    // when
    const result = rebuildTabsWithPath(path, tabs, selectedTabIndex)

    // then
    expect(result).toEqual({ updatedTabs: [{ name: '메인', urlPath: '/' }], updatedSelectedTabIndex: 0 })
  })

  it('빈 경로가 주어지고 탭이 없으면 비어야한다', () => {
    // given
    const path = EMPTY_PATH
    const tabs = [] as Tab[]
    const selectedTabIndex = 0

    // when
    const result = rebuildTabsWithPath(path, tabs, selectedTabIndex)

    // then
    expect(result).toEqual({ updatedTabs: [], updatedSelectedTabIndex: 0 })
  })

  it('빈 경로가 주어지고 탭이 있어도 비어야한다', () => {
    // given
    const path = EMPTY_PATH
    const tabs = [{ name: '메인', urlPath: '/' }]
    const selectedTabIndex = 0

    // when
    const result = rebuildTabsWithPath(path, tabs, selectedTabIndex)

    // then
    expect(result).toEqual({ updatedTabs: [], updatedSelectedTabIndex: 0 })
  })

  it('특정 경로가 주어지고 빈탭이면 주어진 특정 경로탭을 만들어 가리켜야한다', () => {
    // given
    const path = '/'
    const tabs = [] as Tab[]
    const selectedTabIndex = 0

    // when
    const result = rebuildTabsWithPath(path, tabs, selectedTabIndex)

    // then
    expect(result).toEqual({ updatedTabs: [{ name: '/', urlPath: '/' }], updatedSelectedTabIndex: 0 })
  })

  it('특정 경로가 주어지고 해당 경로가 탭에 없으면 주어진 특정 경로탭을 최신탭으로 만들어 가리켜야한다', () => {
    // given
    const path = '/'
    const tabs = [{ name: '/1', urlPath: '/1' }]
    const selectedTabIndex = 0

    // when
    const result = rebuildTabsWithPath(path, tabs, selectedTabIndex)

    // then
    expect(result.updatedTabs.length).toBe(2)
    expect(result.updatedTabs[1]).toEqual({ name: '/', urlPath: '/' })
  })

  it('특정 경로가 주어지고 해당 경로가 탭에 있으면 그 특정탭을 가리켜야한다', () => {
    // given
    const path = '/'
    const tabs = [{ name: '/', urlPath: '/' }]
    const selectedTabIndex = 0

    // when
    const result = rebuildTabsWithPath(path, tabs, selectedTabIndex)

    // then
    expect(result).toEqual({ updatedTabs: [{ name: '/', urlPath: '/' }], updatedSelectedTabIndex: 0 })
  })
})
