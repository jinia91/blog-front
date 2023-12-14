"use client";

import React, {Dispatch, SetStateAction, useContext,} from "react";
import {TabBarContext} from "@/components/DynamicLayout";
import {createMemo} from "@/api/memo";
import {Memo, SimpleMemoInfo} from "@/domain/Memo";

export default function NewMemoLink({name, memoRef, setMemoRef, children}: { name: string, memoRef: SimpleMemoInfo[],setMemoRef: Dispatch<SetStateAction<SimpleMemoInfo[]>>, children: React.ReactNode }) {
  const {tabs, setTabs, setSelectedTabIdx} = useContext(TabBarContext);
  const addTab = async () => {
    const response = await createMemo("1");
    const newHref = `/memo/${response.memoId}`;
    
    const newTab = {name: name, context: newHref};
    const updatedTabs = [...tabs, newTab];
    setTabs(updatedTabs);
    setSelectedTabIdx(updatedTabs.length - 1);
    const newMemo : Memo = {memoId: response.memoId, title: '', content: '', references: []};
    const newMemos = [...memoRef, newMemo];
    setMemoRef(newMemos);
  };
  
  return (
    <div onClick={addTab}>
      {children}
    </div>
  );
}
