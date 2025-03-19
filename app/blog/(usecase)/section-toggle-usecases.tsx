import { atom, useAtom } from 'jotai/index'

const PublishMode = atom<boolean>(true)

export const useSectionMode = (): {
  isPublishMode: boolean
  toggleSectionMode: () => void
} => {
  const [isPublishMode, setIsPublishMode] = useAtom(PublishMode)

  const toggleSectionMode = (): void => {
    setIsPublishMode(!isPublishMode)
  }

  return {
    isPublishMode,
    toggleSectionMode
  }
}
