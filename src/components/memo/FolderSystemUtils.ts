import {FolderInfo} from "@/api/models";

// folderRef update utils
export const afterDeleteMemoInFolders = (folders: FolderInfo[], deletedMemoId: string): FolderInfo[] => {
  return folders.reduce((acc: FolderInfo[], folder: FolderInfo) => {
    const filteredMemos = folder.memos.filter(memo => memo.id.toString() !== deletedMemoId);
    const updatedChildren = afterDeleteMemoInFolders(folder.children, deletedMemoId);
    const updatedFolder = {
      ...folder,
      memos: filteredMemos,
      children: updatedChildren
    };
    return [...acc, updatedFolder];
  }, []);
};


export const updateTitleInFolders = (folders: FolderInfo[], memoId: string | undefined, newTitle: string): FolderInfo[] => {
  return folders.reduce((acc: FolderInfo[], folder: FolderInfo) => {
    const updatedMemos = folder.memos.map(memo => {
      if (memo.id.toString() === memoId) {
        return {...memo, title: newTitle};
      } else {
        return memo;
      }
    });
    const updatedChildren = updateTitleInFolders(folder.children, memoId, newTitle);
    const updatedFolder = {
      ...folder,
      memos: updatedMemos,
      children: updatedChildren
    };
    return [...acc, updatedFolder];
  }, []);
}
