import { type Folder } from '../../(domain)/folder'

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
