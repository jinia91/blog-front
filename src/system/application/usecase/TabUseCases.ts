import { restoreTabsFromLocalStorage } from '@/system/infra/localstorage/TabLocalStorage'
import { type Tab } from '@/system/application/domain/Tab'
import { useAtom } from 'jotai'
import { SelectedTabIdxAtom, TabsAtom } from '@/system/infra/atom/TabManagerAtom'

export function useTabs (): {
  initializeTabs: (path: string) => Promise<void>
  tabs: Tab[]
  selectedTabIdx: number
  selectTab: (index: number) => void
  removeTab: (target: number) => void
  setTabs: (newTabs: Tab[]) => void
} {
  const [tabs, setTabs] = useAtom(TabsAtom)
  const [selectedTabIdx, setSelectedTabIdx] = useAtom(SelectedTabIdxAtom)

  const initializeTabs = async (path: string): Promise<void> => {
    const tabsList = restoreTabsFromLocalStorage()
    const newTabs = rebuildTabs(path, tabsList)
    const tabIndex = newTabs.findIndex((tab: Tab) => tab.urlPath === path)
    const newSelected = tabIndex >= 0 ? tabIndex : 0
    setTabsAtom(newTabs, newSelected)
  }

  function rebuildTabs (path: string, tabsList: Tab[]): Tab[] {
    if (path.startsWith('/login/oauth2')) {
      if (tabsList == null || tabsList.length === 0) {
        return [{ name: '/', urlPath: '/' }]
      } else {
        return tabsList
      }
    }
    if (tabsList == null || (tabsList.length === 0 && path !== '/empty')) {
      return path === '/empty' ? [] : [{ name: path, urlPath: path }]
    }
    if ((tabsList.length === 0 && path === '/empty') || (tabsList.length !== 0 && path === '/empty')) {
      return []
    }
    return tabsList
  }

  function setTabsAtom (newTabs: Tab[], newSelected: number): void {
    setTabs(newTabs)
    setSelectedTabIdx(newSelected)
    localStorage.setItem('tabs', JSON.stringify(newTabs))
    localStorage.setItem('selectedTabIdx', String(newSelected))
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

  return { initializeTabs, tabs, selectTab, selectedTabIdx, removeTab, setTabs: setTabsWithLocalStorage }
}
