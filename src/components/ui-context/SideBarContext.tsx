"use client";
import React, {createContext, useState} from "react";

const initialValue = {isCollapsed: false};

const SidebarContext: React.Context<any> = createContext(initialValue);

const DynamicLayout = ({topNav, sideBar, main}: {
  topNav: React.ReactNode,
  sideBar: React.ReactNode,
  main: React.ReactNode
}) => {
  const [isCollapsed, setCollapse] = useState(false);
  console.log("동적 레이아웃 렌더링")
  
  const toggleSideBarCollapse = () => {
    setCollapse((prevState) => !prevState);
  };
  
  return (
    <SidebarContext.Provider value={{isCollapsed, toggleSideBarCollapse}}>
      <header className="sticky top-0 w-full dark:bg-gray-900 border-b">{topNav}</header>
      <div className="md:flex overflow-hidden">
        <aside className="fixed md:static flex-1 h-screen bg-white dark:bg-gray-900 border-r">
          {sideBar}
        </aside>
        <main className="p-5 flex-grow bg-white dark:bg-gray-800 text-black dark:text-white w-screen h-screen overflow-auto">
          {main}
        </main>
      </div>
    </SidebarContext.Provider>
  );
};
export {SidebarContext, DynamicLayout};
