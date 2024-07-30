import { type FolderInfo } from '@/memo/application/domain/models'
import { useAtom } from 'jotai'
import { folderAtom } from '@/memo/infra/atom/folder-atom'
import { createFolder, deleteFolderById, fetchFolderAndMemo, fetchSearchResults } from '@/memo/infra/api/memo'

export const useFolder = (): {
  folders: FolderInfo[]
  setFolders: (folders: FolderInfo[]) => void
  initialization: () => Promise<void>
  refreshFolders: () => Promise<void>
  createNewFolder: () => Promise<void>
  searchMemoAndFolders: (value: string) => Promise<void>
  deleteFolder: (folderId: string) => Promise<FolderInfo[]>
} => {
  const [folders, setFoldersAtom] = useAtom(folderAtom)

  const fetchAndSetFolders = async (): Promise<void> => {
    const fetchedFolders = await fetchFolderAndMemo()
    if (fetchedFolders === null) {
      console.debug('폴더 정보를 가져오는데 실패했습니다.')
      return
    }
    setFoldersAtom(fetchedFolders)
  }

  const initialization = async (): Promise<void> => {
    await fetchAndSetFolders()
  }

  const refreshFolders = async (): Promise<void> => {
    await fetchAndSetFolders()
  }

  const setFolders = (folders: FolderInfo[]): void => {
    setFoldersAtom(folders)
  }

  const createNewFolder = async (): Promise<void> => {
    const newFolder = await createFolder()

    function orderedNewFolders (newFolder: FolderInfo): FolderInfo[] {
      const newFolders = [...folders.filter((folder) => folder.id !== null), newFolder]
      const unCategorizedFolder = folders.find((folder) => folder.id === null)
      if (unCategorizedFolder != null) {
        newFolders.push(unCategorizedFolder)
      }
      return newFolders
    }

    const newFolders = orderedNewFolders(newFolder)
    setFolders(newFolders)
  }

  const searchMemoAndFolders = async (value: string): Promise<void> => {
    const folders = await fetchSearchResults(value)
    if (folders == null) {
      throw new Error('폴더 검색에 실패했습니다.')
    }
    setFolders(folders)
  }

  const deleteFolder = async (folderId: string): Promise<FolderInfo[]> => {
    const result = await deleteFolderById(folderId.toString())
    if (result != null) {
      await fetchAndSetFolders()
    }
    return folders
  }

  return { initialization, folders, setFolders, refreshFolders, createNewFolder, searchMemoAndFolders, deleteFolder }
}
