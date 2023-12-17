"use client";

import React, {Dispatch, SetStateAction} from "react";
import {FolderInfo, SimpleMemoInfo} from "@/api/models";
import {createFolder} from "@/api/memo";

export default function NewFolder({foldersRef, setFoldersRef, children}: {
  foldersRef: FolderInfo[],
  setFoldersRef: Dispatch<SetStateAction<FolderInfo[]>>,
  children: React.ReactNode
}) {
  const createNewFolder = async () => {
    const response = await createFolder("1");
    const newFolderId = response.folderId;
    const newFolderName = response.folderName;
    
    const unCategoryFolder = foldersRef.find((folder) => folder.id === null);
    const newFolder : FolderInfo = {
      id: newFolderId,
      name: newFolderName,
      children: [],
      memos: [],
      parent: null,
    };
    const newFolders = [...foldersRef.filter((folder) => folder.id !== null), newFolder];
    if (unCategoryFolder) {
      newFolders.push(unCategoryFolder);
    }
    setFoldersRef(newFolders);
  };
  
  return (
    <div onClick={createNewFolder}>
      {children}
    </div>
  );
}
