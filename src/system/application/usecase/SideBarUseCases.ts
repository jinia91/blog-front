import { useAtom } from 'jotai'
import { SideBarAtom } from '@/system/infra/atom/SideBarAtom'

export const useSideBar = (): {
  isCollapsed: boolean
  setCollapsed: (value: boolean) => void
  toggleSideBarCollapse: () => void
} => {
  const [isCollapsed, setCollapsed] = useAtom(SideBarAtom)

  const toggleSideBarCollapse = (): void => {
    setCollapsed(!isCollapsed)
  }

  return { isCollapsed, setCollapsed, toggleSideBarCollapse }
}
