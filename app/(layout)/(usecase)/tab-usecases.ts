import { type Tab, TabBarUtils } from '../(domain)/tab'
import { atom, useAtom } from 'jotai'
import { usePathname, useRouter } from 'next/navigation'

const restoreTabsFromLocalStorage = (): Tab[] => {
  const savedTabs = localStorage.getItem('tabs')
  return (savedTabs != null) ? JSON.parse(savedTabs) : null
}

const restoreSelectedTabIdxFromLocalStorage = (): number => {
  const savedIdx = localStorage.getItem('selectedTabIdx')
  return (savedIdx != null) ? Number(savedIdx) : 0
}

const TabsAtom = atom<Tab[]>([])

const SelectedTabIdxAtom = atom<number>(0)

export function useTabBarAndRouter (): {
  tabs: Tab[]
  selectedTabIdx: number
  initializeTabBar: (path: string) => void
  selectTab: (index: number) => void
  removeTab: (target: number) => void
  moveSelectedTabTo: (to: number) => void
  upsertAndSelectTab: (newTab: Tab) => void
  removeAllTabs: () => void
  closeOtherTabsWithOut: (targetTab: Tab) => void
  updateTabBar: (newTabs: Tab[], newSelectedTabIdx: number) => void
} {
  const [tabsAtom, setTabsAtom] = useAtom(TabsAtom)
  const [selectedTabIdxAtom, setSelectedTabIdxAtom] = useAtom(SelectedTabIdxAtom)
  const router = useRouter()
  const path = usePathname()

  const initializeTabBar = (path: string): void => {
    const preTabs = restoreTabsFromLocalStorage()
    const asIsSelectedTabIdx = restoreSelectedTabIdxFromLocalStorage()
    const preTabBarState = { tabs: preTabs, selectedTabIndex: asIsSelectedTabIdx }
    const toBeState = TabBarUtils.rebuildWithPath(preTabBarState, path)
    setTabBarAndRoute(toBeState.tabs, toBeState.selectedTabIndex)
  }

  const selectTab = (index: number): void => {
    setTabBarAndRoute(tabsAtom, index)
  }

  const removeTab = (target: number): void => {
    const pre = { tabs: tabsAtom, selectedTabIndex: selectedTabIdxAtom }
    const toBe = TabBarUtils.removeTargetTabAndSelectNear(pre, target)
    setTabBarAndRoute(toBe.tabs, toBe.selectedTabIndex)
  }

  const moveSelectedTabTo = (to: number): void => {
    const pre = { tabs: tabsAtom, selectedTabIndex: selectedTabIdxAtom }
    const toBe = TabBarUtils.moveSelectedTabTo(pre, to)
    setTabBarAndRoute(toBe.tabs, toBe.selectedTabIndex)
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
      setTabBarAndRoute(updatedTabs, updatedTabs.length - 1)
    }
  }

  const removeAllTabs = (): void => {
    setTabBarAndRoute([], 0)
  }

  const closeOtherTabsWithOut = (targetTab: Tab): void => {
    setTabBarAndRoute([targetTab], 0)
  }

  const updateTabBar = (newTabs: Tab[], newSelectedTabIdx: number): void => {
    setTabBarAndRoute(newTabs, newSelectedTabIdx)
  }

  function setTabBarAndRoute (newTabs: Tab[], newSelected: number): void {
    setTabBar(newTabs, newSelected)
    route(newTabs, newSelected)
  }

  function setTabBar (newTabs: Tab[], newSelected: number): void {
    if (tabsAtom !== newTabs) {
      setTabsAtom(newTabs)
      localStorage.setItem('tabs', JSON.stringify(newTabs))
    }
    if (selectedTabIdxAtom !== newSelected) {
      setSelectedTabIdxAtom(newSelected)
      localStorage.setItem('selectedTabIdx', String(newSelected))
    }
  }

  function route (newTabs: Tab[], newSelected: number): void {
    if (newTabs.length === 0) {
      router.push('/empty')
    } else if (newTabs[newSelected].urlPath !== path) {
      router.push(newTabs[newSelected].urlPath)
    }
  }

  return {
    tabs: tabsAtom,
    selectedTabIdx: selectedTabIdxAtom,
    initializeTabBar,
    selectTab,
    removeTab,
    moveSelectedTabTo,
    upsertAndSelectTab,
    removeAllTabs,
    closeOtherTabsWithOut,
    updateTabBar
  }
}
