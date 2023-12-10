"use client";

import React, {useContext,} from "react";
import {TabBarContext} from "@/components/DynamicLayout";
import {createMemo} from "@/api/memo";

export default function NewMemoLink({name, children}: { name: string, children: React.ReactNode }) {
  const {tabs, setTabs, setSelectedTabIdx} = useContext(TabBarContext);
  const addTab = async () => {
    const response = await createMemo("1");
    console.log(response);
    const newHref = `/memo/${response.memoId}`;
    
    const newTab = {name: name, context: newHref};
    const updatedTabs = [...tabs, newTab];
    setTabs(updatedTabs);
    setSelectedTabIdx(updatedTabs.length - 1);
  };
  
  return (
    <div onClick={addTab}>
      {children}
    </div>
  );
}
