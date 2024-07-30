import { type Tab } from '@/system/application/domain/Tab'

export const restoreTabsFromLocalStorage = (): Tab[] => {
  const savedTabs = localStorage.getItem('tabs')
  return (savedTabs != null) ? JSON.parse(savedTabs) : null
}

export const restoreSelectedTabIdxFromLocalStorage = (): number => {
  const savedIdx = localStorage.getItem('selectedTabIdx')
  return (savedIdx != null) ? Number(savedIdx) : 0
}
