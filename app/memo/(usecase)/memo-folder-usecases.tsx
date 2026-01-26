import { type SimpleMemoInfo } from '../(domain)/memo'
import { type Folder, folderManager } from '../(domain)/folder'
import { atom, useAtom } from 'jotai'
import {
  createMemo,
  deleteFolderById,
  deleteMemoById,
  fetchFolderAndMemo,
  fetchReferencedByMemoId,
  fetchReferencesByMemoId,
  fetchSearchResults,
  makeRelationshipWithFolders,
  makeRelationshipWithMemoAndFolders,
  requestCreateFolder
} from '../(infra)/memo'

const folderAtom = atom<Folder[]>([])

export const useFolderAndMemo = (): {
  folders: Folder[]
  setFolders: (folders: Folder[]) => void
  initializeFolderAndMemo: () => Promise<void>
  refreshFolders: () => Promise<void>
  createNewFolder: (parentId?: number) => Promise<void>
  searchMemosByKeyword: (value: string) => Promise<void>
  deleteFolder: (folderId: string) => Promise<Folder[]>
  searchReferenceMemos: (targetMemoId: string) => Promise<void>
  createNewMemo: (parentFolderId?: number) => Promise<string>
  writeNewMemoTitle: (memoId: string, newTitle: string) => void
  makeRelationshipAndRefresh: ({ id, type }: { id: number, type: string }, targetFolderId: number | null) => Promise<void>
  deleteMemo: (memoId: string) => Promise<void>
} => {
  const [folders, setFoldersAtom] = useAtom(folderAtom)

  const setFolders = (folders: Folder[]): void => {
    setFoldersAtom(folders)
  }

  const initializeFolderAndMemo = async (): Promise<void> => {
    await fetchAndSetFolders()
  }

  const refreshFolders = async (): Promise<void> => {
    await fetchAndSetFolders()
  }

  const createNewFolder = async (parentId?: number): Promise<void> => {
    const newFolder = await requestCreateFolder(parentId)
    if (newFolder === null) {
      throw new Error('폴더 생성에 실패했습니다.')
    }
    if (parentId !== undefined) {
      const newFolders = folderManager.rebuildFoldersAtCreatingSubfolder(folders, parentId, newFolder)
      setFolders(newFolders)
    } else {
      const newFolders = folderManager.rebuildFoldersAtCreatingNewFolder(folders, newFolder)
      setFolders(newFolders)
    }
  }

  const searchMemosByKeyword = async (value: string): Promise<void> => {
    const resultMemos = await fetchSearchResults(value)
    const resultFolder = folderManager.buildSearchResultFolders(resultMemos)
    setFolders(resultFolder)
  }

  const deleteFolder = async (folderId: string): Promise<Folder[]> => {
    const result = await deleteFolderById(folderId.toString())
    if (result === null) {
      throw new Error('폴더 삭제에 실패했습니다.')
    }
    await fetchAndSetFolders()
    return folders
  }

  async function fetchAndSetFolders (): Promise<void> {
    const fetchedFolders = await fetchFolderAndMemo()
    if (fetchedFolders === null) {
      throw new Error('폴더 정보를 가져오는데 실패했습니다.')
    }
    setFoldersAtom(fetchedFolders)
  }

  const searchReferenceMemos = async (targetMemoId: string): Promise<void> => {
    const references = await fetchReferencesByMemoId(targetMemoId) ?? []
    const referenced = await fetchReferencedByMemoId(targetMemoId) ?? []
    const newFolders = folderManager.buildReferenceFolders(references, referenced)
    setFolders(newFolders)
  }

  const createNewMemo = async (parentFolderId?: number): Promise<string> => {
    const memo = await createMemo(parentFolderId)
    if (memo === null) {
      throw new Error('메모 생성에 실패했습니다.')
    }
    const newMemo: SimpleMemoInfo = { id: memo.memoId, title: '', references: [] }
    if (parentFolderId !== undefined) {
      const newFolders = folderManager.rebuildFoldersAtCreatingMemoInFolder(folders, parentFolderId, newMemo)
      setFolders(newFolders)
    } else {
      const newFolders = folderManager.rebuildFoldersAtCreatingNewMemo(folders, newMemo)
      setFolders(newFolders)
    }
    return memo.memoId.toString()
  }

  const writeNewMemoTitle = (memoId: string, newTitle: string): void => {
    const newFolders = folderManager.rebuildFoldersAtUpdatingMemoTitle(folders, memoId, newTitle ?? '')
    setFolders(newFolders)
  }

  const makeRelationshipAndRefresh = async ({ id, type }: {
    id: number
    type: string
  }, targetFolderId: number | null): Promise<void> => {
    if (type === 'memo') {
      const result = await makeRelationshipWithMemoAndFolders(id.toString(), targetFolderId?.toString() ?? null)
      if (result === null) {
        throw new Error('메모 -> 폴더 이동에 실패했습니다.')
      }
      await fetchAndSetFolders()
    } else if (type === 'folder') {
      const result = await makeRelationshipWithFolders(id.toString(), targetFolderId?.toString() ?? null)
      if (result === null) {
        throw new Error('폴더 -> 폴더 이동에 실패했습니다.')
      }
      await fetchAndSetFolders()
    } else {
      throw new Error('잘못된 타입입니다.')
    }
  }

  const deleteMemo = async (memoId: string): Promise<void> => {
    const result = await deleteMemoById(memoId)
    if (!result) {
      throw new Error('메모 삭제에 실패했습니다.')
    }
    const newFolderStructure = folderManager.rebuildFoldersAtDeletingMemo(folders, memoId)
    setFolders(newFolderStructure)
  }

  return {
    initializeFolderAndMemo,
    refreshFolders,
    folders,
    setFolders,
    createNewFolder,
    searchMemosByKeyword,
    deleteFolder,
    searchReferenceMemos,
    createNewMemo,
    writeNewMemoTitle,
    makeRelationshipAndRefresh,
    deleteMemo
  }
}
