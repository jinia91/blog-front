import { type SimpleMemoInfo } from './memo'

export interface Folder {
  id: number | null
  name: string
  parent: Folder | null
  children: Folder[]
  memos: SimpleMemoInfo[]
}

export const folderManager = {
  isFolderHasMemo (folder: Folder, memoId: string): boolean {
    if (folder.memos.some(memo => memo.id.toString() === memoId)) {
      return true
    }
    return folder.children.some(childFolder => this.isFolderHasMemo(childFolder, memoId))
  }
}

export function extractFolderIdByMemoId (folders: Folder[], memoId: string): string | null {
  for (const folder of folders) {
    if (folderManager.isFolderHasMemo(folder, memoId)) {
      return folder.id?.toString() ?? null
    }
  }
  return null
}

export function findUnCategorizedFolder (folders: Folder[]): Folder | null {
  return folders.find((folder) => folder.id === null) ?? null
}

export function includeNewMemoToFolders (folders: Folder[], memo: SimpleMemoInfo): Folder[] {
  const unCategoryFolder = findUnCategorizedFolder(folders)
  const newUnCategoryFolder: Folder = (unCategoryFolder != null)
    ? {
        ...unCategoryFolder,
        memos: [...unCategoryFolder.memos, memo]
      }
    : { id: null, name: 'unCategory', parent: null, memos: [memo], children: [] }
  return [...folders.filter((folder) => folder.id !== null), newUnCategoryFolder]
}

export const updateMemoTitleByMemoIdInFolders = (folders: Folder[], memoId: string | undefined, newTitle: string): Folder[] => {
  return folders.reduce((acc: Folder[], folder: Folder) => {
    const updatedMemos = folder.memos.map(memo => {
      if (memo.id.toString() === memoId) {
        return { ...memo, title: newTitle }
      } else {
        return memo
      }
    })
    const updatedChildren = updateMemoTitleByMemoIdInFolders(folder.children, memoId, newTitle)
    const updatedFolder = {
      ...folder,
      memos: updatedMemos,
      children: updatedChildren
    }
    return [...acc, updatedFolder]
  }, [])
}

export const buildReferenceFolders = (references: SimpleMemoInfo[], referenced: SimpleMemoInfo[]): Folder[] => {
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
  return [referenceFolderInfo, referencedFolderInfo]
}

export const rebuildMemoDeleted = (folders: Folder[], deletedMemoId: string): Folder[] => {
  return folders.reduce((acc: Folder[], folder: Folder) => {
    const filteredMemos = folder.memos.filter(memo => memo.id.toString() !== deletedMemoId)
    const updatedChildren = rebuildMemoDeleted(folder.children, deletedMemoId)
    const updatedFolder = {
      ...folder,
      memos: filteredMemos,
      children: updatedChildren
    }
    return [...acc, updatedFolder]
  }, [])
}

export const rebuildNewNameFolder = (folders: Folder[], folderId: string, newName: string): Folder[] => {
  return folders.reduce((acc: Folder[], folder: Folder) => {
    if (folder.id?.toString() === folderId) {
      return [...acc, { ...folder, name: newName }]
    } else {
      const updatedChildren = rebuildNewNameFolder(folder.children, folderId, newName)
      const updatedFolder = {
        ...folder,
        children: updatedChildren
      }
      return [...acc, updatedFolder]
    }
  }, [])
}
