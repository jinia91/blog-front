import { LOGIN_PATH } from '../../(utils)/constants'

export enum ApplicationType {
  MEMO = 'MEMO',
  COMMON = 'COMMON',
}

export interface Tab {
  name: string
  urlPath: string
  type?: ApplicationType
}

export interface TabBarState {
  tabs: Tab[]
  selectedTabIndex: number
}

export const tabBarManager: {
  rebuildWithPath: (preState: TabBarState, path: string) => TabBarState
  removeTargetTabAndSelectNear: (pre: TabBarState, target: number) => TabBarState
  removeTargetTabAndUpsert: (pre: TabBarState, target: number, newTab: Tab) => TabBarState
  moveSelectedTabTo: (pre: TabBarState, to: number) => TabBarState
  removeTargetTabsAndSelect: (pre: TabBarState, targets: number[]) => TabBarState
} = {
  rebuildWithPath (preState: TabBarState, path: string): TabBarState {
    const { tabs: tabsList, selectedTabIndex: selectedTabIdx } = preState
    // 로그인시 예외 핸들링
    if (path.startsWith(LOGIN_PATH)) {
      return {
        tabs: (tabsList.length > 0) ? tabsList : [{ name: '/', urlPath: '/' }],
        selectedTabIndex: selectedTabIdx
      }
    }

    // 빈 페이지 예외 핸들링
    if (path === '/empty') {
      return {
        tabs: [],
        selectedTabIndex: 0
      }
    }

    // 탭이 없을 경우, 새로운 탭을 생성
    if (tabsList.length === 0) {
      return {
        tabs: [{ name: path, urlPath: path }],
        selectedTabIndex: 0
      }
    }

    // 탭이 있고 패쓰의 탭이 이미 존재할 경우
    const existingTabIndex = tabsList.findIndex(tab => tab.urlPath === path)
    if (existingTabIndex !== -1) {
      return {
        tabs: tabsList,
        selectedTabIndex: existingTabIndex
      }
    }

    // 탭이 있지만 패쓰가 없을 경우, 새로운 탭을 생성
    tabsList.push({ name: path, urlPath: path })
    return {
      tabs: tabsList,
      selectedTabIndex: tabsList.length - 1
    }
  },

  removeTargetTabAndSelectNear (pre: TabBarState, target: number): TabBarState {
    const newTabs = pre.tabs.filter((_, idx) => idx !== target)
    const newSelectedTabIdx = pre.selectedTabIndex === target
      ? Math.max(0, target - 1)
      : pre.selectedTabIndex > target
        ? pre.selectedTabIndex - 1
        : pre.selectedTabIndex

    return { tabs: newTabs, selectedTabIndex: newSelectedTabIdx }
  },

  moveSelectedTabTo (pre: TabBarState, to: number): TabBarState {
    const copiedTabs = [...pre.tabs]
    const draggedTab = copiedTabs[pre.selectedTabIndex]
    copiedTabs.splice(pre.selectedTabIndex, 1)
    copiedTabs.splice(to, 0, draggedTab)
    return { tabs: copiedTabs, selectedTabIndex: to }
  },

  removeTargetTabsAndSelect (pre: TabBarState, targets: number[]): TabBarState {
    const newTabs = pre.tabs.filter((_, idx) => !targets.includes(idx))
    const asIsSelectedTab = pre.tabs[pre.selectedTabIndex]
    const asIsSelectedIndexBasedNewTabs = newTabs.findIndex(tab => tab.urlPath === asIsSelectedTab.urlPath)
    const newSelectedTabIdx = asIsSelectedIndexBasedNewTabs === -1
      ? newTabs.length > 0
        ? newTabs.length - 1
        : 0
      : asIsSelectedIndexBasedNewTabs
    return { tabs: newTabs, selectedTabIndex: newSelectedTabIdx }
  },

  removeTargetTabAndUpsert (pre: TabBarState, target: number, newTab: Tab): TabBarState {
    const newTabs = pre.tabs.filter((_, idx) => idx !== target)
    const idx = newTabs.findIndex(tab => tab.urlPath === newTab.urlPath)
    if (idx === -1) {
      return { tabs: [...newTabs, newTab], selectedTabIndex: newTabs.length }
    } else {
      return { tabs: newTabs, selectedTabIndex: idx }
    }
  }
}
