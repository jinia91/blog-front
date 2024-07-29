import { useAtom } from 'jotai'
import { SideBarAtom } from '@/system/infra/atom/SideBarAtom'

export const useSideBar = (): {
  isCollapsed: boolean
  toggleSideBarCollapse: () => void
} => {
  const [isCollapsed, setSideBar] = useAtom(SideBarAtom)

  const toggleSideBarCollapse = (): void => {
    setSideBar(!isCollapsed)
  }

  return { isCollapsed, toggleSideBarCollapse }
}
