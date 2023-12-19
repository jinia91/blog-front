"use client";

import React, {useContext} from "react";
import {TabBarContext} from "@/components/DynamicLayout";
import {MemoEditContext} from "@/components/memo/MemoFolderContainer";

export default function TabLink({ name, href, children } : { name:string, href: string, children: React.ReactNode }) {
  const { tabs, selectedTabIdx, setTabs, setSelectedTabIdx } = useContext(TabBarContext);
  const { underwritingId, setUnderwritingId } = useContext(MemoEditContext);
  const isMemoTab = href.startsWith("/memo/");
  
  const addTab = () => {
    if(!isMemoTab) {
      setUnderwritingId("");
    }
    
    const existingTabIndex = tabs.findIndex(function (tab : any) {
      return tab.context === href;
    });
    
    if (existingTabIndex !== -1) {
      setSelectedTabIdx(existingTabIndex);
    } else {
      const newTab = { name: name, context: href };
      const updatedTabs = [...tabs, newTab];
      setTabs(updatedTabs);
      setSelectedTabIdx(updatedTabs.length - 1);
    }
  };
  
  return (
    <div onClick={addTab}>
      {children}
    </div>
  );
}