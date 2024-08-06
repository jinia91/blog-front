import { type SimpleMemoInfo } from './memo'

export interface Folder {
  id: number | null
  name: string
  parent: Folder | null
  children: Folder[]
  memos: SimpleMemoInfo[]
}

export const folderFinder: {
  findFolderById: (folders: Folder[], folderId: number) => Folder | null
  findMemoIdsInFolderRecursively: (folder: Folder) => string[]
  findFolderIdsPathToMemoId: (folders: Folder[], memoId: string) => string[]
  findUnCategorizedFolder: (folders: Folder[]) => Folder | null
} = {
  findFolderById (folders: Folder[], folderId: number): Folder | null {
    const findFolderRecursive = (folders: Folder[], folderId: number): Folder | null => {
      for (const folder of folders) {
        if (folder.id === folderId) {
          return folder
        }
        const found = findFolderRecursive(folder.children, folderId)
        if (found != null) {
          return found
        }
      }
      return null
    }
    return findFolderRecursive(folders, folderId)
  },

  findMemoIdsInFolderRecursively (folder: Folder): string[] {
    const extractMemoIdsRecursive = (folder: Folder): string[] => {
      const memoIds = folder.memos.map(memo => memo.id.toString())
      const childrenMemoIds = folder.children.flatMap(child => extractMemoIdsRecursive(child))
      return [...memoIds, ...childrenMemoIds]
    }
    return extractMemoIdsRecursive(folder)
  },

  findFolderIdsPathToMemoId (folders: Folder[], memoId: string): string[] {
    let isFound = false
    const findPathToMemo = (folder: Folder, memoId: string, result: string[]): void => {
      if (isFound) return

      if (folder.memos.some(memo => memo.id.toString() === memoId)) {
        isFound = true
        result.push(folder.id?.toString() ?? '0')
        return
      }

      folder.children.forEach(childFolder => {
        findPathToMemo(childFolder, memoId, result)
      })

      if (isFound) {
        result.push(folder.id?.toString() ?? '0')
      }
    }

    const result: string[] = []
    folders.forEach(folder => {
      if (result.length > 0) return
      findPathToMemo(folder, memoId, result)
    })

    return result
  },

  findUnCategorizedFolder (folders: Folder[]): Folder | null {
    return folders.find((folder) => folder.id === null) ?? null
  }
}

export const folderManager: {
  rebuildFoldersAtIncludingNewMemo: (folders: Folder[], memo: SimpleMemoInfo) => Folder[]
  rebuildFoldersAtUpdatingMemoTitle: (folders: Folder[], memoId: string, newTitle: string) => Folder[]
  rebuildFoldersAtDeletingMemo: (folders: Folder[], deletedMemoId: string) => Folder[]
  rebuildAtNamingFolder: (folders: Folder[], folderId: string, newName: string) => Folder[]
  rebuildAtCreatingNewFolder: (folders: Folder[], newFolder: Folder) => Folder[]
  buildReferenceFolders: (references: SimpleMemoInfo[], referenced: SimpleMemoInfo[]) => Folder[]
  buildSearchResultFolders: (resultMemos: SimpleMemoInfo[] | null) => Folder[]
} = {
  rebuildFoldersAtIncludingNewMemo (folders: Folder[], memo: SimpleMemoInfo): Folder[] {
    const unCategoryFolder = folderFinder.findUnCategorizedFolder(folders)
    const newUnCategoryFolder: Folder = (unCategoryFolder != null)
      ? { ...unCategoryFolder, memos: [...unCategoryFolder.memos, memo] }
      : { id: null, name: 'unCategory', parent: null, memos: [memo], children: [] }
    return [...folders.filter((folder) => folder.id !== null), newUnCategoryFolder]
  },

  rebuildFoldersAtUpdatingMemoTitle (folders: Folder[], memoId: string, newTitle: string): Folder[] {
    return folders.map(folder => {
      const updatedMemos = folder.memos.map(memo => memo.id.toString() === memoId ? { ...memo, title: newTitle } : memo)
      const updatedChildren = this.rebuildFoldersAtUpdatingMemoTitle(folder.children, memoId, newTitle)
      return { ...folder, memos: updatedMemos, children: updatedChildren }
    })
  },

  rebuildFoldersAtDeletingMemo (folders: Folder[], deletedMemoId: string): Folder[] {
    return folders.map(folder => {
      const filteredMemos = folder.memos.filter(memo => memo.id.toString() !== deletedMemoId)
      const updatedChildren = this.rebuildFoldersAtDeletingMemo(folder.children, deletedMemoId)
      return { ...folder, memos: filteredMemos, children: updatedChildren }
    })
  },

  rebuildAtNamingFolder (folders: Folder[], folderId: string, newName: string): Folder[] {
    return folders.map(folder => {
      if (folder.id?.toString() === folderId) {
        return { ...folder, name: newName }
      } else {
        const updatedChildren = this.rebuildAtNamingFolder(folder.children, folderId, newName)
        return { ...folder, children: updatedChildren }
      }
    })
  },
  rebuildAtCreatingNewFolder (folders: Folder[], newFolder: Folder): Folder[] {
    const unCategorizedFolder = folderFinder.findUnCategorizedFolder(folders)
    if (unCategorizedFolder == null) throw new Error('uncategorized 폴더가 존재하지 않습니다.')
    if (folderFinder.findFolderById(folders, newFolder.id!) != null) throw new Error('이미 존재하는 폴더입니다.')

    const newFolders = [...folders.filter((folder) => folder.id !== null), newFolder]
    newFolders.push(unCategorizedFolder)
    return newFolders
  },
  buildReferenceFolders (references: SimpleMemoInfo[], referenced: SimpleMemoInfo[]): Folder[] {
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
  },
  buildSearchResultFolders (resultMemos: SimpleMemoInfo[] | null): Folder[] {
    return [
      {
        id: null,
        name: '검색결과',
        parent: null,
        memos: resultMemos ?? [],
        children: []
      }
    ]
  }
}
