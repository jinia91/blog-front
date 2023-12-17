"use client";

import React, {Dispatch, SetStateAction, useContext,} from "react";
import {TabBarContext} from "@/components/DynamicLayout";
import {createMemo} from "@/api/memo";
import {FolderInfo, Memo, SimpleMemoInfo} from "@/api/models";

// @ts-ignore
export default function NewMemoLink({name, foldersRef, setFoldersRef, children}: {
  name: string, foldersRef: FolderInfo[],setFoldersRef: Dispatch<SetStateAction<FolderInfo[]>>, children: React.ReactNode
}) {
  const {tabs, setTabs, setSelectedTabIdx} = useContext(TabBarContext);
  const addTab = async () => {
    const response = await createMemo("1");
    const newHref = `/memo/${response.memoId}`;
    const newTab = {name: name, context: newHref};
    const updatedTabs = [...tabs, newTab];
    setTabs(updatedTabs);
    setSelectedTabIdx(updatedTabs.length - 1);
   const newMemo : SimpleMemoInfo = {id: response.memoId, title: '',  references: []};
   const unCategoryFolder = foldersRef.find((folder) => folder.id === null);
   const newUnCategoryFolder : FolderInfo = unCategoryFolder ? {...unCategoryFolder, memos: [...unCategoryFolder.memos, newMemo]} : {id: null, name: 'unCategory', parent: null, memos: [newMemo], children: []};
   const newFolders = [...foldersRef.filter((folder) => folder.id !== null), newUnCategoryFolder];
   setFoldersRef(newFolders);
  };
  
  return (
    <div onClick={addTab}>
      {children}
    </div>
  );
}
