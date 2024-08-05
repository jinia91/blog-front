import { type Tab, tabBarManager, type TabBarState } from '../(domain)/tab'
import { atom, useAtom } from 'jotai'
import { usePathname, useRouter } from 'next/navigation'
import { EMPTY_PATH } from '../../(utils)/constants'

const TABS_KEY = 'tabs'
const SELECTED_TAB_IDX_KEY = 'selectedTabIdx'

const restoreTabsFromLocalStorage = (): Tab[] => {
  const savedTabs = localStorage.getItem(TABS_KEY)
  return (savedTabs != null) ? JSON.parse(savedTabs) : []
}

const restoreSelectedTabIdxFromLocalStorage = (): number => {
  const savedIdx = localStorage.getItem(SELECTED_TAB_IDX_KEY)
  return (savedIdx != null) ? Number(savedIdx) : 0
}

const TabsAtom = atom<Tab[]>([])
const SelectedTabIdxAtom = atom<number>(0)

export function useTabBarAndRouter (): {
  tabs: Tab[]
  selectedTabIdx: number
  initializeTabBar: (path: string) => void
  selectTab: (index: number) => void
  closeTab: (target: number) => void
  moveSelectedTabTo: (to: number) => void
  upsertAndSelectTab: (newTab: Tab) => void
  closeAllTabs: () => void
  closeOtherTabsWithOut: (targetTabIdx: number) => void
  updateTabBar: (newTabs: Tab[], newSelectedTabIdx: number) => void
  closeTabs: (targets: number[]) => void
} {
  const [tabsAtom, setTabsAtom] = useAtom(TabsAtom)
  const [selectedTabIdxAtom, setSelectedTabIdxAtom] = useAtom(SelectedTabIdxAtom)
  const router = useRouter()
  const path = usePathname()

  const initializeTabBar = (path: string): void => {
    const preTabs = restoreTabsFromLocalStorage()
    const asIsSelectedTabIdx = restoreSelectedTabIdxFromLocalStorage()
    const preTabBarState = { tabs: preTabs, selectedTabIndex: asIsSelectedTabIdx }
    const toBeState = tabBarManager.rebuildWithPath(preTabBarState, path)
    setTabBarAndRoute(toBeState)
  }

  const selectTab = (index: number): void => {
    setTabBarAndRoute({ tabs: tabsAtom, selectedTabIndex: index })
  }

  const closeTab = (target: number): void => {
    const pre = { tabs: tabsAtom, selectedTabIndex: selectedTabIdxAtom }
    const toBe = tabBarManager.removeTargetTabAndSelectNear(pre, target)
    setTabBarAndRoute(toBe)
  }

  const moveSelectedTabTo = (to: number): void => {
    const pre = { tabs: tabsAtom, selectedTabIndex: selectedTabIdxAtom }
    const toBe = tabBarManager.moveSelectedTabTo(pre, to)
    setTabBarAndRoute(toBe)
  }

  const upsertAndSelectTab = (newTab: Tab): void => {
    const foundIdx = tabsAtom.findIndex(tab => {
      return tab.urlPath === newTab.urlPath
    })
    const isExist = foundIdx !== -1
    if (isExist) {
      selectTab(foundIdx)
    } else {
      const updatedTabs = [...tabsAtom, newTab]
      setTabBarAndRoute({ tabs: updatedTabs, selectedTabIndex: updatedTabs.length - 1 })
    }
  }

  const closeAllTabs = (): void => {
    setTabBarAndRoute({ tabs: [], selectedTabIndex: 0 })
  }

  const closeOtherTabsWithOut = (targetTabIdx: number): void => {
    const newTabBarState = { tabs: [tabsAtom[targetTabIdx]], selectedTabIndex: 0 }
    setTabBarAndRoute(newTabBarState)
  }

  // fixme: 메모시스템 유즈케이스 리팩토링시 제거
  const updateTabBar = (newTabs: Tab[], newSelectedTabIdx: number): void => {
    const tabBar = { tabs: newTabs, selectedTabIndex: newSelectedTabIdx }
    setTabBarAndRoute(tabBar)
  }

  const closeTabs = (targets: number[]): void => {
    const newTabs = tabsAtom.filter((_, idx) => !targets.includes(idx))
    const asIsSelectedTab = tabsAtom[selectedTabIdxAtom]
    const asIsSelectedIndexBasedNewTabs = newTabs.findIndex(tab => tab.urlPath === asIsSelectedTab.urlPath)
    const newSelectedTabIdx = asIsSelectedIndexBasedNewTabs === -1 ? newTabs.length > 0 ? newTabs.length - 1 : 0 : asIsSelectedIndexBasedNewTabs
    setTabBarAndRoute({ tabs: newTabs, selectedTabIndex: newSelectedTabIdx })
  }

  function setTabBarAndRoute (tabBar: TabBarState): void {
    setTabBar(tabBar)
    route(tabBar)
  }

  function setTabBar (tabBar: TabBarState): void {
    const { tabs: newTabs, selectedTabIndex: newSelected } = tabBar
    if (tabsAtom !== newTabs) {
      setTabsAtom(newTabs)
      localStorage.setItem(TABS_KEY, JSON.stringify(newTabs))
    }
    if (selectedTabIdxAtom !== newSelected) {
      setSelectedTabIdxAtom(newSelected)
      localStorage.setItem(SELECTED_TAB_IDX_KEY, String(newSelected))
    }
  }

  function route (tabBar: TabBarState): void {
    const { tabs: newTabs, selectedTabIndex: newSelected } = tabBar
    if (newTabs.length === 0) {
      router.push(EMPTY_PATH)
    } else if (newTabs[newSelected].urlPath !== path) {
      router.push(newTabs[newSelected].urlPath)
    }
  }

  return {
    tabs: tabsAtom,
    selectedTabIdx: selectedTabIdxAtom,
    initializeTabBar,
    selectTab,
    upsertAndSelectTab,
    moveSelectedTabTo,
    closeTab,
    closeAllTabs,
    closeOtherTabsWithOut,
    closeTabs,
    updateTabBar
  }
}
