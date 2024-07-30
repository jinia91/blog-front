import { type Folder } from '@/memo/application/domain/models'

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

export const rebuildMemoTitle = (folders: Folder[], memoId: string | undefined, newTitle: string): Folder[] => {
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

export function folderContainsMemo (folder: Folder, memoId: string): boolean {
  if (folder.memos.some(memo => memo.id.toString() === memoId)) {
    return true
  }
  return folder.children.some(childFolder => folderContainsMemo(childFolder, memoId))
}
