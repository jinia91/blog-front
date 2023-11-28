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
      <header className="sticky top-0 z-10 flex-shrink-0 w-full">{topNav}</header>
      <div className="md:flex">
        <aside className="fixed md:static h-screen bg-white dark:bg-black">
          {sideBar}
        </aside>
        <main className={"bg-white dark:bg-gray-700 text-black dark:text-white w-screen"}>
          {main}
        </main>
      </div>
    </SidebarContext.Provider>
  );
};
export {SidebarContext, DynamicLayout};
