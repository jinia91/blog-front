"use client";
import Link from "next/link";
import React, {useContext} from "react";
import {TabBarContext} from "@/components/DynamicLayout";

export default function TabLink({ name, href, children } : { name:string, href: string, children: React.ReactNode }) {
  const { tabs, selectedTabIdx, setTabs, setSelectedTabIdx } = useContext(TabBarContext);
  
  const addTab = () => {
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
