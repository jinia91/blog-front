import { atom, useAtom } from 'jotai'

const sideBarAtom = atom<boolean>(true)
export const useSideBar = (): {
  isCollapsed: boolean
  toggleSideBarCollapse: () => void
} => {
  const [isCollapsed, setSideBar] = useAtom(sideBarAtom)

  const toggleSideBarCollapse = (): void => {
    setSideBar(!isCollapsed)
  }

  return { isCollapsed, toggleSideBarCollapse }
}
