import {
  restoreSelectedTabIdxFromLocalStorage,
  restoreTabsFromLocalStorage
} from '@/system/infra/localstorage/TabLocalStorage'
import { type Tab } from '@/system/application/domain/Tab'
import { useAtom } from 'jotai'
import { SelectedTabIdxAtom, TabsAtom } from '@/system/infra/atom/TabManagerAtom'

export function useTabs (): {
  initializeTabs: (path: string) => void
  tabs: Tab[]
  selectedTabIdx: number
  selectTab: (index: number) => void
  removeTab: (target: number) => void
  setTabs: (newTabs: Tab[]) => void
  moveTabTo: (from: number, to: number) => void
  upsertAndSelectTab: (newTab: Tab) => void
} {
  const [tabs, setTabs] = useAtom(TabsAtom)
  const [selectedTabIdx, setSelectedTabIdx] = useAtom(SelectedTabIdxAtom)

  const initializeTabs = (path: string): void => {
    const tabsList = restoreTabsFromLocalStorage()
    const newTabs = rebuildTabsWithPath(path, tabsList)
    const asIsSelectedTabIdx = restoreSelectedTabIdxFromLocalStorage()
    const newSelectedTabIdx = rebuildSelectedTabIdx(path, newTabs, asIsSelectedTabIdx)
    setTabsAtom(newTabs, newSelectedTabIdx)
  }

  function rebuildTabsWithPath (path: string, tabsList: Tab[]): Tab[] {
    // 로그인시 예외 핸들링
    if (path.startsWith('/login/oauth2')) {
      if (tabsList == null || tabsList.length === 0) {
        return [{ name: '/', urlPath: '/' }]
      } else {
        return tabsList
      }
    }

    // 빈 페이지 예외 핸들링
    if (path === '/empty') {
      return []
    }

    // 탭이 없을 경우
    if (tabsList == null || tabsList.length === 0) {
      return [{ name: path, urlPath: path }]
    }

    // 탭이 있고 패쓰가 있을경우
    if (tabsList.some((tab: Tab) => tab.urlPath === path)) {
      return tabsList
    }

    // 탭이 있지만 패쓰가 없을경우
    tabsList.push({ name: path, urlPath: path })

    return tabsList
  }

  function rebuildSelectedTabIdx (path: string, tabsList: Tab[], asIsSelectedTabIdx: number): number {
    // 로그인시 예외 핸들링
    if (path.startsWith('/login/oauth2')) {
      return asIsSelectedTabIdx
    }

    // 빈 페이지 예외 핸들링
    if (path === '/empty') {
      return 0
    }

    // 탭이 없을 경우
    if (tabsList == null || tabsList.length === 0) {
      return 0
    }

    // 탭이 있고 패쓰가 있을경우
    if (tabsList.some((tab: Tab) => tab.urlPath === path)) {
      return tabsList.findIndex((tab: Tab) => tab.urlPath === path)
    }

    // 탭이 있지만 패쓰가 없을경우
    return tabsList.length - 1
  }

  const selectTab = (index: number): void => {
    setSelectedTabIdx(index)
    localStorage.setItem('selectedTabIdx', String(index))
  }

  const removeTab = (target: number): void => {
    const newTabs = tabs.filter((_, idx) => idx !== target)

    const newSelectedTabIdx = selectedTabIdx === target
      ? Math.max(0, target - 1)
      : selectedTabIdx > target
        ? selectedTabIdx - 1
        : selectedTabIdx

    setTabsAtom(newTabs, newSelectedTabIdx)
  }

  const setTabsWithLocalStorage = (newTabs: Tab[]): void => {
    setTabsAtom(newTabs, selectedTabIdx)
    localStorage.setItem('tabs', JSON.stringify(newTabs))
  }

  const moveTabTo = (from: number, to: number): void => {
    const newTabs = [...tabs]
    const draggedTab = newTabs[from]
    newTabs.splice(from, 1)
    newTabs.splice(to, 0, draggedTab)
    setTabsAtom(newTabs, to)
  }

  const upsertAndSelectTab = (newTab: Tab): void => {
    const existingTabIndex = tabs.findIndex(function (tab: Tab) {
      return tab.urlPath === newTab.urlPath
    })

    if (existingTabIndex !== -1) {
      selectTab(existingTabIndex)
    } else {
      const updatedTabs = [...tabs, newTab]
      setTabsAtom(updatedTabs, updatedTabs.length - 1)
    }
  }

  function setTabsAtom (newTabs: Tab[], newSelected: number): void {
    setTabs(newTabs)
    setSelectedTabIdx(newSelected)
    localStorage.setItem('tabs', JSON.stringify(newTabs))
    localStorage.setItem('selectedTabIdx', String(newSelected))
  }

  return {
    initializeTabs,
    tabs,
    selectTab,
    selectedTabIdx,
    removeTab,
    setTabs: setTabsWithLocalStorage,
    moveTabTo,
    upsertAndSelectTab
  }
}
