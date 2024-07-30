import { type SimpleMemoInfo } from '@/memo/application/domain/memo'
import {
  buildReferenceFolders,
  findUnCategorizedFolder,
  type Folder,
  includeNewMemoToFolders,
  updateMemoTitleByMemoIdInFolders
} from '@/memo/application/domain/folder'
import { atom, useAtom } from 'jotai'
import {
  createFolder,
  createMemo,
  deleteFolderById,
  fetchFolderAndMemo,
  fetchReferencedByMemoId,
  fetchReferencesByMemoId,
  fetchSearchResults,
  makeRelationshipWithFolders,
  makeRelationshipWithMemoAndFolders
} from '@/memo/infra/api/memo'

const folderAtom = atom<Folder[]>([])

export const useFolderAndMemo = (): {
  folders: Folder[]
  setFolders: (folders: Folder[]) => void
  initialization: () => Promise<void>
  refreshFolders: () => Promise<void>
  createNewFolder: () => Promise<void>
  searchMemo: (value: string) => Promise<void>
  deleteFolder: (folderId: string) => Promise<Folder[]>
  fetchReferenceMemos: (targetMemoId: string) => Promise<void>
  createNewMemo: () => Promise<string>
  writeNewMemoTitle: (memoId: string, newTitle: string) => void
  makeRelationshipAndRefresh: ({ id, type }: { id: number, type: string }, targetFolderId: number | null) => Promise<void>
} => {
  const [folders, setFoldersAtom] = useAtom(folderAtom)

  const initialization = async (): Promise<void> => {
    await fetchAndSetFolders()
  }

  const refreshFolders = async (): Promise<void> => {
    await fetchAndSetFolders()
  }

  const setFolders = (folders: Folder[]): void => {
    setFoldersAtom(folders)
  }

  const createNewFolder = async (): Promise<void> => {
    const newFolder = await createFolder()

    function orderedNewFolders (newFolder: Folder): Folder[] {
      const newFolders = [...folders.filter((folder) => folder.id !== null), newFolder]
      const unCategorizedFolder = findUnCategorizedFolder(newFolders)
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

  const deleteFolder = async (folderId: string): Promise<Folder[]> => {
    const result = await deleteFolderById(folderId.toString())
    if (result != null) {
      await fetchAndSetFolders()
    }
    return folders
  }

  async function fetchAndSetFolders (): Promise<void> {
    const fetchedFolders = await fetchFolderAndMemo()
    if (fetchedFolders === null) {
      throw new Error('폴더 정보를 가져오는데 실패했습니다.')
    }
    setFoldersAtom(fetchedFolders)
  }

  const fetchReferenceMemos = async (targetMemoId: string): Promise<void> => {
    const references = await fetchReferencesByMemoId(targetMemoId) ?? []
    const referenced = await fetchReferencedByMemoId(targetMemoId) ?? []
    const newFolders = buildReferenceFolders(references, referenced)
    setFolders(newFolders)
  }

  const createNewMemo = async (): Promise<string> => {
    const memo = await createMemo()
    if (memo == null) {
      throw new Error('메모 생성에 실패했습니다.')
    }
    const newMemo: SimpleMemoInfo = { id: memo.memoId, title: '', references: [] }
    const newFolders = includeNewMemoToFolders(folders, newMemo)
    setFolders(newFolders)
    return memo.memoId.toString()
  }

  const writeNewMemoTitle = (memoId: string, newTitle: string): void => {
    const newFolders = updateMemoTitleByMemoIdInFolders(folders, memoId, newTitle ?? '')
    setFolders(newFolders)
  }

  const makeRelationshipAndRefresh = async ({ id, type }: {
    id: number
    type: string
  }, targetFolderId: number | null): Promise<void> => {
    if (type === 'memo') {
      const result = await makeRelationshipWithMemoAndFolders(id.toString(), targetFolderId?.toString() ?? null)
      if (result != null) {
        await refreshFolders()
      } else {
        console.log('fail')
      }
    } else if (type === 'folder') {
      const result = await makeRelationshipWithFolders(id.toString(), targetFolderId?.toString() ?? null)
      if (result != null) {
        await refreshFolders()
      } else {
        console.log('fail')
      }
    }
  }

  return {
    initialization,
    folders,
    setFolders,
    refreshFolders,
    createNewFolder,
    searchMemo: searchMemoAndFolders,
    deleteFolder,
    fetchReferenceMemos,
    createNewMemo,
    writeNewMemoTitle,
    makeRelationshipAndRefresh
  }
}
