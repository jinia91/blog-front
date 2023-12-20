"use client";

import React, {Dispatch, SetStateAction, useContext,} from "react";
import {TabBarContext} from "@/components/DynamicLayout";
import {createMemo} from "@/api/memo";
import {FolderInfo, Memo, SimpleMemoInfo} from "@/api/models";
import Image from "next/image";
import newMemo from "../../../../public/newMemo.png";

// @ts-ignore
export default function NewMemoLink({name, foldersRef, setFoldersRef}: {
  name: string,
  foldersRef: FolderInfo[],
  setFoldersRef: Dispatch<SetStateAction<FolderInfo[]>>,
}) {
  const {tabs, setTabs, setSelectedTabIdx} = useContext(TabBarContext);
  const addTab = async () => {
    const response = await createMemo("1");
    const newHref = `/memo/${response.memoId}`;
    const newTab = {name: name, context: newHref};
    const updatedTabs = [...tabs, newTab];
    setTabs(updatedTabs);
    setSelectedTabIdx(updatedTabs.length - 1);
    const newMemo: SimpleMemoInfo = {id: response.memoId, title: '', references: []};
    const unCategoryFolder = foldersRef.find((folder) => folder.id === null);
    const newUnCategoryFolder: FolderInfo = unCategoryFolder ? {
      ...unCategoryFolder,
      memos: [...unCategoryFolder.memos, newMemo]
    } : {id: null, name: 'unCategory', parent: null, memos: [newMemo], children: []};
    const newFolders = [...foldersRef.filter((folder) => folder.id !== null), newUnCategoryFolder];
    setFoldersRef(newFolders);
  };
  
  return (
    <div className="tooltip">
      <div onClick={addTab}>
        <button
          className="text-white hover:text-gray-300"
          aria-label='newMemo'
          type='button'
        >
          <Image src={newMemo} alt={"newMemo"}
                 className={"white-image"}
                 width={30} height={30}/>
        </button>
        <span className="tooltip-message">새 메모</span>
      </div>
    </div>
  );
}
