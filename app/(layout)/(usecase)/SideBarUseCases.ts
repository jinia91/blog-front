import { atom, useAtom } from 'jotai'

const SideBarAtom = atom<boolean>(true)

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
