import { type Folder, type SimpleMemoInfo } from '@/memo/application/domain/models'
import { useAtom } from 'jotai'
import { folderAtom } from '@/memo/infra/atom/folder-atom'
import {
  createFolder,
  createMemo,
  deleteFolderById,
  fetchFolderAndMemo,
  fetchReferencedByMemoId,
  fetchReferencesByMemoId,
  fetchSearchResults
} from '@/memo/infra/api/memo'

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
      console.debug('폴더 정보를 가져오는데 실패했습니다.')
      return
    }
    setFoldersAtom(fetchedFolders)
  }

  const fetchReferenceMemos = async (targetMemoId: string): Promise<void> => {
    const references = await fetchReferencesByMemoId(targetMemoId) ?? []
    const referenced = await fetchReferencedByMemoId(targetMemoId) ?? []
    const referenceFolderInfo = {
      id: 1,
      name: '참조중',
      parent: null,
      memos: references,
      children: []
    }
    const referencedFolderInfo = {
      id: 2,
      name: '참조됨',
      parent: null,
      memos: referenced,
      children: []
    }
    const newFolders = [referenceFolderInfo, referencedFolderInfo]
    setFolders(newFolders)
  }

  const createNewMemo = async (): Promise<string> => {
    const memo = await createMemo()
    if (memo == null) {
      throw new Error('메모 생성에 실패했습니다.')
    }

    const newMemo: SimpleMemoInfo = { id: memo.memoId, title: '', references: [] }
    const unCategoryFolder = folders.find((folder) => folder.id === null)
    const newUnCategoryFolder: Folder = (unCategoryFolder != null)
      ? {
          ...unCategoryFolder,
          memos: [...unCategoryFolder.memos, newMemo]
        }
      : { id: null, name: 'unCategory', parent: null, memos: [newMemo], children: [] }
    const newFolders = [...folders.filter((folder) => folder.id !== null), newUnCategoryFolder]
    setFolders(newFolders)
    console.log('생성된 memoId:', memo.memoId.toString())
    return memo.memoId.toString()
  }

  const writeNewMemoTitle = (memoId: string, newTitle: string): void => {
    const newFolders = rebuildMemoTitle(folders, memoId, newTitle ?? '')
    setFolders(newFolders)
  }

  const rebuildMemoTitle = (folders: Folder[], memoId: string | undefined, newTitle: string): Folder[] => {
    return folders.reduce((acc: Folder[], folder: Folder) => {
      const updatedMemos = folder.memos.map(memo => {
        if (memo.id.toString() === memoId) {
          return { ...memo, title: newTitle }
        } else {
          return memo
        }
      })
      const updatedChildren = rebuildMemoTitle(folder.children, memoId, newTitle)
      const updatedFolder = {
        ...folder,
        memos: updatedMemos,
        children: updatedChildren
      }
      return [...acc, updatedFolder]
    }, [])
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
    writeNewMemoTitle
  }
}
