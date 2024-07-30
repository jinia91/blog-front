import {
  restoreSelectedTabIdxFromLocalStorage,
  restoreTabsFromLocalStorage
} from '@/system/infra/localstorage/TabLocalStorage'
import { type Tab } from '@/system/application/domain/Tab'
import { useAtom } from 'jotai'
import { SelectedTabIdxAtom, TabsAtom } from '@/system/infra/atom/TabManagerAtom'
import { useRouter } from 'next/navigation'

export function useTabs (): {
  initializeTabs: (path: string) => void
  tabs: Tab[]
  selectedTabIdx: number
  selectTab: (index: number) => void
  removeTab: (target: number) => void
  moveTabTo: (from: number, to: number) => void
  upsertAndSelectTab: (newTab: Tab) => void
  removeAllTabs: () => void
  closeOtherTabsWith: (targetTab: Tab) => void
  updateNewTabsAndSelect: (newTabs: Tab[], newSelectedTabIdx: number) => void
} {
  const [tabs, setTabsAtom] = useAtom(TabsAtom)
  const [selectedTabIdx, setSelectedTabIdxAtom] = useAtom(SelectedTabIdxAtom)
  const router = useRouter()

  const initializeTabs = (path: string): void => {
    const tabsList = restoreTabsFromLocalStorage()
    const newTabs = rebuildTabsWithPath(path, tabsList)
    const asIsSelectedTabIdx = restoreSelectedTabIdxFromLocalStorage()
    const newSelectedTabIdx = rebuildSelectedTabIdx(path, newTabs, asIsSelectedTabIdx)
    setTabsAndRoute(newTabs, newSelectedTabIdx)
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
    setSelectedTabIdxAtom(index)
    if (tabs.length === 0) {
      router.push('/empty')
    } else {
      router.push(tabs[index].urlPath)
    }
    localStorage.setItem('selectedTabIdx', String(index))
  }

  const removeTab = (target: number): void => {
    const newTabs = tabs.filter((_, idx) => idx !== target)

    const newSelectedTabIdx = selectedTabIdx === target
      ? Math.max(0, target - 1)
      : selectedTabIdx > target
        ? selectedTabIdx - 1
        : selectedTabIdx

    setTabsAndRoute(newTabs, newSelectedTabIdx)
  }

  const moveTabTo = (from: number, to: number): void => {
    const newTabs = [...tabs]
    const draggedTab = newTabs[from]
    newTabs.splice(from, 1)
    newTabs.splice(to, 0, draggedTab)
    setTabsAndRoute(newTabs, to)
  }

  const upsertAndSelectTab = (newTab: Tab): void => {
    const alReadyExistingTabIndex = tabs.findIndex(function (tab: Tab) {
      return tab.urlPath === newTab.urlPath
    })

    if (alReadyExistingTabIndex !== -1) {
      selectTab(alReadyExistingTabIndex)
    } else {
      const updatedTabs = [...tabs, newTab]
      setTabsAndRoute(updatedTabs, updatedTabs.length - 1)
    }
  }

  const removeAllTabs = (): void => {
    setTabsAndRoute([], 0)
  }

  const closeOtherTabs = (targetTab: Tab): void => {
    setTabsAndRoute([targetTab], 0)
  }

  const updateNewTabsAndSelect = (newTabs: Tab[], newSelectedTabIdx: number): void => {
    setTabsAndRoute(newTabs, newSelectedTabIdx)
  }

  function setTabsAndRoute (newTabs: Tab[], newSelected: number): void {
    setTabsAtom(newTabs)
    setSelectedTabIdxAtom(newSelected)
    if (newTabs.length === 0) {
      router.push('/empty')
    } else {
      router.push(newTabs[newSelected].urlPath)
    }
    localStorage.setItem('tabs', JSON.stringify(newTabs))
    localStorage.setItem('selectedTabIdx', String(newSelected))
  }

  return {
    tabs,
    selectedTabIdx,
    initializeTabs,
    selectTab,
    removeTab,
    moveTabTo,
    upsertAndSelectTab,
    removeAllTabs,
    closeOtherTabsWith: closeOtherTabs,
    updateNewTabsAndSelect
  }
}
