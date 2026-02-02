import { type SimpleMemoInfo } from './memo'

export interface Folder {
  id: number | null
  name: string
  sequence?: string // 디폴트: '' (빈 문자열), 백엔드에서 없을 수 있음
  parent: Folder | null
  children: Folder[]
  memos: SimpleMemoInfo[]
}

export interface BreadcrumbItem {
  id: number | null
  name: string
}

export const folderFinder: {
  findFolderById: (folders: Folder[], folderId: number) => Folder | null
  findMemoIdsInFolderRecursively: (folder: Folder) => string[]
  findFolderIdsPathToMemoId: (folders: Folder[], memoId: string) => string[]
  findFolderPathToMemoId: (folders: Folder[], memoId: string) => BreadcrumbItem[]
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

  findFolderPathToMemoId (folders: Folder[], memoId: string): BreadcrumbItem[] {
    let isFound = false
    const findPathToMemo = (folder: Folder, memoId: string, result: BreadcrumbItem[]): void => {
      if (isFound) return

      if (folder.memos.some(memo => memo.id.toString() === memoId)) {
        isFound = true
        result.push({ id: folder.id, name: folder.name })
        return
      }

      folder.children.forEach(childFolder => {
        findPathToMemo(childFolder, memoId, result)
      })

      if (isFound) {
        result.push({ id: folder.id, name: folder.name })
      }
    }

    const result: BreadcrumbItem[] = []
    folders.forEach(folder => {
      if (result.length > 0) return
      findPathToMemo(folder, memoId, result)
    })

    return result.reverse()
  },

  findUnCategorizedFolder (folders: Folder[]): Folder | null {
    return folders.find((folder) => folder.id === null) ?? null
  }
}

export const folderManager: {
  rebuildFoldersAtCreatingNewMemo: (folders: Folder[], memo: SimpleMemoInfo) => Folder[]
  rebuildFoldersAtCreatingMemoInFolder: (folders: Folder[], parentFolderId: number, memo: SimpleMemoInfo) => Folder[]
  rebuildFoldersAtUpdatingMemoTitle: (folders: Folder[], memoId: string, newTitle: string) => Folder[]
  rebuildFoldersAtDeletingMemo: (folders: Folder[], deletedMemoId: string) => Folder[]
  rebuildFoldersAtCreatingNewFolder: (folders: Folder[], newFolder: Folder) => Folder[]
  rebuildFoldersAtCreatingSubfolder: (folders: Folder[], parentId: number, newFolder: Folder) => Folder[]
  rebuildFoldersAtUpdatingFolderTitle: (folders: Folder[], folderId: string, newName: string) => Folder[]
  buildReferenceFolders: (references: SimpleMemoInfo[], referenced: SimpleMemoInfo[]) => Folder[]
  buildSearchResultFolders: (resultMemos: SimpleMemoInfo[] | null) => Folder[]
  flattenFolder: (folder: Folder) => Folder[]
} = {
  rebuildFoldersAtCreatingNewMemo (folders: Folder[], memo: SimpleMemoInfo): Folder[] {
    const unCategoryFolder = folderFinder.findUnCategorizedFolder(folders)
    const newUnCategoryFolder: Folder = (unCategoryFolder != null)
      ? { ...unCategoryFolder, memos: [...unCategoryFolder.memos, memo] }
      : { id: null, name: 'unCategory', sequence: '', parent: null, memos: [memo], children: [] }
    return [...folders.filter((folder) => folder.id !== null), newUnCategoryFolder]
  },

  rebuildFoldersAtCreatingMemoInFolder (folders: Folder[], parentFolderId: number, memo: SimpleMemoInfo): Folder[] {
    const addToFolder = (folderList: Folder[]): Folder[] => {
      return folderList.map(folder => {
        if (folder.id === parentFolderId) {
          return { ...folder, memos: [...folder.memos, memo] }
        }
        return { ...folder, children: addToFolder(folder.children) }
      })
    }
    return addToFolder(folders)
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

  rebuildFoldersAtUpdatingFolderTitle (folders: Folder[], folderId: string, newName: string): Folder[] {
    return folders.map(folder => {
      if (folder.id?.toString() === folderId) {
        return { ...folder, name: newName }
      } else {
        const updatedChildren = this.rebuildFoldersAtUpdatingFolderTitle(folder.children, folderId, newName)
        return { ...folder, children: updatedChildren }
      }
    })
  },
  rebuildFoldersAtCreatingNewFolder (folders: Folder[], newFolder: Folder): Folder[] {
    const unCategorizedFolder = folderFinder.findUnCategorizedFolder(folders)
    if (unCategorizedFolder === null) throw new Error('uncategorized 폴더가 존재하지 않습니다.')
    if (folderFinder.findFolderById(folders, newFolder.id ?? 0) != null) throw new Error('이미 존재하는 폴더입니다.')

    const newFolders = [...folders.filter((folder) => folder.id !== null), newFolder]
    newFolders.push(unCategorizedFolder)
    return newFolders
  },
  rebuildFoldersAtCreatingSubfolder (folders: Folder[], parentId: number, newFolder: Folder): Folder[] {
    const addToParent = (folderList: Folder[]): Folder[] => {
      return folderList.map(folder => {
        if (folder.id === parentId) {
          return { ...folder, children: [...folder.children, newFolder] }
        }
        return { ...folder, children: addToParent(folder.children) }
      })
    }
    return addToParent(folders)
  },
  buildReferenceFolders (references: SimpleMemoInfo[], referenced: SimpleMemoInfo[]): Folder[] {
    const referenceFolderInfo: Folder = {
      id: 1,
      name: '참조중',
      sequence: '',
      parent: null,
      memos: references,
      children: []
    }
    const referencedFolderInfo: Folder = {
      id: 2,
      name: '참조됨',
      sequence: '',
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
        sequence: '',
        parent: null,
        memos: resultMemos ?? [],
        children: []
      }
    ]
  },
  flattenFolder (folder: Folder): Folder[] {
    const children = folder.children.flatMap(child => this.flattenFolder(child))
    return [folder, ...children]
  }
}
