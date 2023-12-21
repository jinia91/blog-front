import { type FolderInfo } from '@/api/models'

// folderRef update utils
export const rebuildMemoDeleted = (folders: FolderInfo[], deletedMemoId: string): FolderInfo[] => {
  return folders.reduce((acc: FolderInfo[], folder: FolderInfo) => {
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

export const rebuildMemoTitle = (folders: FolderInfo[], memoId: string | undefined, newTitle: string): FolderInfo[] => {
  return folders.reduce((acc: FolderInfo[], folder: FolderInfo) => {
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

export const rebuildNewNameFolder = (folders: FolderInfo[], folderId: string, newName: string): FolderInfo[] => {
  return folders.reduce((acc: FolderInfo[], folder: FolderInfo) => {
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

export function folderContainsMemo (folder: FolderInfo, memoId: string): boolean {
  if (folder.memos.some(memo => memo.id.toString() === memoId)) {
    return true
  }
  return folder.children.some(childFolder => folderContainsMemo(childFolder, memoId))
}
