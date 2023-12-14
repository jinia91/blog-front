import React, {createContext, useState} from "react";

export const SidebarContext: React.Context<any> = createContext({isCollapsed: true});

export default function SideBarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setCollapse] = useState(true);
  
  const toggleSideBarCollapse = () => {
    setCollapse((prevState) => !prevState);
  };
  
  return (
    <SidebarContext.Provider value={{isCollapsed, toggleSideBarCollapse}}>
      {children}
    </SidebarContext.Provider>
  )
}
