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
  const path = usePathname()

  const initializeTabs = (path: string): void => {
    const preTabs = restoreTabsFromLocalStorage()
    const asIsSelectedTabIdx = restoreSelectedTabIdxFromLocalStorage()
    const { tabs, selectedTabIndex } = TabBarUtils.rebuildWithPath({
      tabs: preTabs,
      selectedTabIndex: asIsSelectedTabIdx
    }, path)
    setTabsAndRoute(tabs, selectedTabIndex)
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
    const { tabs: newTabs, selectedTabIndex: newSelectedTabIdx } = TabBarUtils.removeTargetTabAndSelectNear({
      tabs,
      selectedTabIndex: selectedTabIdx
    }, target)
    setTabsAndRoute(newTabs, newSelectedTabIdx)
  }

  const moveTabTo = (from: number, to: number): void => {
    const newTabBarState = TabBarUtils.moveSelectedTabTo({ tabs, selectedTabIndex: selectedTabIdx }, to)
    setTabsAndRoute(newTabBarState.tabs, newTabBarState.selectedTabIndex)
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
    } else if (newTabs[newSelected].urlPath !== path) {
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
