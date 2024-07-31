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

export function rebuildTabsWithPath (path: string, tabsList: Tab[], selectedTabIdx: number): {
  updatedTabs: Tab[]
  updatedSelectedTabIndex: number
} {
  // 로그인시 예외 핸들링
  if (path.startsWith(LOGIN_PATH)) {
    return {
      updatedTabs: (tabsList.length > 0) ? tabsList : [{ name: '/', urlPath: '/' }],
      updatedSelectedTabIndex: selectedTabIdx
    }
  }

  // 빈 페이지 예외 핸들링
  if (path === '/empty') {
    return {
      updatedTabs: [],
      updatedSelectedTabIndex: 0
    }
  }

  // 탭이 없을 경우, 새로운 탭을 생성
  if (tabsList.length === 0) {
    return {
      updatedTabs: [{ name: path, urlPath: path }],
      updatedSelectedTabIndex: 0
    }
  }

  // 탭이 있고 패쓰의 탭이 이미 존재할 경우
  const existingTabIndex = tabsList.findIndex(tab => tab.urlPath === path)
  if (existingTabIndex !== -1) {
    return {
      updatedTabs: tabsList,
      updatedSelectedTabIndex: existingTabIndex
    }
  }

  // 탭이 있지만 패쓰가 없을 경우, 새로운 탭을 생성
  tabsList.push({ name: path, urlPath: path })
  return {
    updatedTabs: tabsList,
    updatedSelectedTabIndex: tabsList.length - 1
  }
}

export function removeTabAndSelect (tabs: Tab[], selectedTabIdx: number, target: number): {
  newTabs: Tab[]
  newSelectedTabIdx: number
} {
  const newTabs = tabs.filter((_, idx) => idx !== target)
  const newSelectedTabIdx = selectedTabIdx === target
    ? Math.max(0, target - 1)
    : selectedTabIdx > target
      ? selectedTabIdx - 1
      : selectedTabIdx

  return {
    newTabs,
    newSelectedTabIdx
  }
}
