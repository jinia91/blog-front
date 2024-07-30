import { type FolderInfo } from '@/memo/application/domain/models'
import { useAtom } from 'jotai'
import { folderAtom } from '@/memo/infra/atom/folder-atom'
import { fetchFolderAndMemo } from '@/memo/infra/api/memo'

export const useFolder = (): {
  folders: FolderInfo[]
  setFolders: (folders: FolderInfo[]) => void
  initialization: () => Promise<void>
  refreshFolders: () => Promise<void>
} => {
  const [folders, setFoldersAom] = useAtom(folderAtom)

  const fetchAndSetFolders = async (): Promise<void> => {
    const fetchedFolders = await fetchFolderAndMemo()
    if (fetchedFolders === null) {
      console.debug('폴더 정보를 가져오는데 실패했습니다.')
      return
    }
    setFoldersAom(fetchedFolders)
  }

  const initialization = async (): Promise<void> => {
    await fetchAndSetFolders()
  }

  const refreshFolders = async (): Promise<void> => {
    await fetchAndSetFolders()
  }

  const setFolders = (folders: FolderInfo[]): void => {
    setFoldersAom(folders)
  }

  return { initialization, folders, setFolders, refreshFolders }
}
