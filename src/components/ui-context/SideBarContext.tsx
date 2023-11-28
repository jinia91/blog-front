"use client";
import React, {createContext, useState} from "react";

const initialValue = {isCollapsed: false};

const SidebarContext: React.Context<any> = createContext(initialValue);

const DynamicLayout = ({sideBar, main}: { sideBar: React.ReactNode, main: React.ReactNode }) => {
  const [isCollapsed, setCollapse] = useState(false);
  console.log("동적 레이아웃 렌더링")
  
  const toggleSideBarCollapse = () => {
    setCollapse((prevState) => !prevState);
  };
  
  const mainClass = isCollapsed ? 'main-full' : 'main-with-sidebar';
  
  return (
    <SidebarContext.Provider value={{isCollapsed, toggleSideBarCollapse}}>
      <aside className={isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}>
        {sideBar}
      </aside>
      <main className={mainClass}>
        {main}
      </main>
    </SidebarContext.Provider>
  );
};
export {SidebarContext, DynamicLayout};
