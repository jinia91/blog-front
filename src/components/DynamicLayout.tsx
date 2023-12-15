"use client";
import React, {createContext, useCallback, useEffect, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import {Tab} from "@/components/tapbar/TabItem";
import {renderPage} from "@/components/AppPageRenderer";
import SideBarProvider from "@/components/sidebar/SiderBarProvider";
import renderContextMenu, {TabContextMenuProps} from "@/components/tapbar/TabContextMenu";
import {ScrollingTabContainer} from "@/components/tapbar/TabBar";

const initialTabStatus = {
  tabs: [],
  selectedTabIdx: 0,
  setTabs: () => {
  },
  setSelectedTabIdx: () => {
  }
};

const TabBarContext: React.Context<any> = createContext(initialTabStatus);
const DynamicLayout = ({topNav, sideBar, page}: {
  topNav: React.ReactNode,
  sideBar: React.ReactNode,
  page: React.ReactNode
}) => {
  const path = usePathname();
  const router = useRouter();
  
  const restoreTabs = () => {
    const savedTabs = localStorage.getItem('tabs');
    return savedTabs ? JSON.parse(savedTabs) : [];
  };
  
  const [tabs, setTabs] = useState<Tab[]>(restoreTabs);
  const [selectedTabIdx, setSelectedTabIdx] = useState<number>(() => {
    const savedTabs = restoreTabs();
    const savedIndex = savedTabs.findIndex((tab: Tab) => tab.context === path);
    return savedIndex >= 0 ? savedIndex : savedTabs.length;
  });
  
  useEffect(() => {
    const existingTabIndex = tabs.findIndex((tab: Tab) => tab.context === path);
    
    if (existingTabIndex === -1 && path == "/empty") {
      return;
    } else if (existingTabIndex === -1) {
      const newTab = {name: path, context: path};
      const newTabs = [...tabs, newTab];
      setTabs(newTabs);
      setSelectedTabIdx(newTabs.length - 1);
    } else {
      setSelectedTabIdx(existingTabIndex);
    }
    
    localStorage.setItem('tabs', JSON.stringify(tabs));
    localStorage.setItem('selectedTabIdx', selectedTabIdx.toString());
  }, [path]);
  
  useEffect(() => {
    const selectedTab = tabs[selectedTabIdx];
    if (selectedTab && selectedTab.context !== path) {
      router.push(selectedTab.context);
    } else if (tabs.length === 0) {
      router.push('/empty');
      localStorage.setItem('tabs', JSON.stringify(tabs));
      localStorage.setItem('selectedTabIdx', "0");
      return
    }
    
    localStorage.setItem('tabs', JSON.stringify(tabs));
    localStorage.setItem('selectedTabIdx', selectedTabIdx.toString());
  }, [selectedTabIdx, tabs]);
  
  const selectTab = (index: number) => {
    setSelectedTabIdx(index);
  };
  
  const removeTab = (target: number) => {
    const newTabs = tabs.filter((_, idx) => idx !== target);
    setTabs(newTabs);
    setSelectedTabIdx(prevIdx => {
      if (prevIdx === target) {
        if (target === tabs.length - 1) {
          return Math.max(0, tabs.length - 2);
        }
        return target;
      }
      return prevIdx > target ? prevIdx - 1 : prevIdx;
    });
  };
  
  // contextMenu
  const [contextMenu, setContextMenu] = useState<TabContextMenuProps | null>(null);
  
  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);
  
  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement>, idx: number) => {
    event.preventDefault();
    setContextMenu({
      xPos: `${event.pageX}px`,
      yPos: `${event.pageY}px`,
      tabIdx: idx,
    });
  }, []);
  
  const closeAllTabs = useCallback(() => {
    setTabs([]);
  }, [setTabs]);
  
  const closeOtherTabs = useCallback(() => {
    if (contextMenu !== null) {
      setTabs(tabs.filter((_, idx) => idx === contextMenu.tabIdx));
      setSelectedTabIdx(0);
    }
  }, [tabs, contextMenu, setTabs]);
  
  const removeTabCallback = useCallback(() => {
    if (contextMenu !== null) {
      removeTab(contextMenu.tabIdx);
    }
  }, [contextMenu]);
  
  useEffect(() => {
    document.addEventListener('click', closeContextMenu);
    return () => {
      document.removeEventListener('click', closeContextMenu);
    };
  }, [closeContextMenu]);
  
  return (
    <SideBarProvider>
      <TabBarContext.Provider value={{tabs, selectedTabIdx, setTabs, setSelectedTabIdx}}>
        <header className="sticky top-0 w-full dark:bg-gray-900 border-b">{topNav}</header>
        <div className="md:flex overflow-hidden">
          <aside className="fixed md:static flex-1 h-screen bg-white dark:bg-gray-900 border-r" style={{zIndex: 1000}}>
            {sideBar}
          </aside>
          <main
            className="p-1 flex-grow bg-white dark:bg-gray-800 text-black dark:text-white w-screen h-screen overflow-auto">
            {renderContextMenu(contextMenu, closeContextMenu, removeTabCallback, closeOtherTabs, closeAllTabs)}
            <div className="bg-gray-800 p-4">
              <ScrollingTabContainer
                tabs={tabs}
                selectedTabIdx={selectedTabIdx}
                onSelectTab={selectTab}
                onRemoveTab={removeTab}
                onContextMenu={handleContextMenu}
              />
              {renderPage(tabs, path, page)}
            </div>
          </main>
        </div>
      </TabBarContext.Provider>
    </SideBarProvider>
  )
};
export {TabBarContext, DynamicLayout};
