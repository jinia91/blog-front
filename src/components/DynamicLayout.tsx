"use client";
import React, {createContext, useCallback, useEffect, useRef, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import {TabItem} from "@/components/tapbar/TabItem";
import {renderPage} from "@/components/AppPageRenderer";
import SideBarProvider from "@/components/sidebar/SiderBarProvider";

interface TabStatus {
  tabs: Tab[];
  selectedTabIdx: number;
}

interface Tab {
  name: string;
  context: string;
}

interface ContextMenuPosition {
  xPos: string;
  yPos: string;
  tabIdx: number;
}

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
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(null);
  
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
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.offsetWidth;
      
      const selectedTabElement: HTMLDivElement = scrollContainerRef.current.children[selectedTabIdx] as HTMLDivElement;
      ;
      
      if (selectedTabElement) {
        const selectedTabOffset = selectedTabElement.offsetLeft;
        const selectedTabWidth = selectedTabElement.offsetWidth;
        
        scrollContainerRef.current.scrollLeft = selectedTabOffset - (containerWidth / 2) + (selectedTabWidth / 2);
      }
    }
  }, [selectedTabIdx, tabs]);
  
  
  useEffect(() => {
    document.addEventListener('click', closeContextMenu);
    return () => {
      document.removeEventListener('click', closeContextMenu);
    };
  }, [closeContextMenu]);
  
  const renderContextMenu = () => (
    contextMenu && (
      <>
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 999
          }}
          onClick={closeContextMenu}
        />
        <ul
          className="p-3 context-menu bg-gray-800 text-white rounded-md shadow-lg overflow-hidden cursor-pointer"
          style={{
            position: 'absolute',
            left: contextMenu.xPos,
            top: contextMenu.yPos,
            zIndex: 1000,
          }}
        >
          <li className={"hover:bg-gray-700 p-1 list-none"} onClick={removeTabCallback}>닫기</li>
          <li className={"hover:bg-gray-700 p-1 list-none"} onClick={closeOtherTabs}>다른 탭 닫기</li>
          <li className={"hover:bg-gray-700 p-1 list-none"} onClick={closeAllTabs}>모든 탭 닫기</li>
        </ul>
      </>
    ));
  
  
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
            {renderContextMenu()}
            <div className="bg-gray-800 p-4">
              {/*탭 컨테이너*/}
              <div className="flex overflow-hidden space-x-2" style={{zIndex: 1}}>
                <div ref={scrollContainerRef} className="flex space-x-1 overflow-x-auto">
                  {tabs.map((tab, idx) => (
                    <TabItem
                      tab={tab}
                      index={idx}
                      isSelected={idx === selectedTabIdx}
                      onSelectTab={selectTab}
                      onRemoveTab={removeTab}
                      onContextMenu={handleContextMenu}
                      key={idx}
                    />
                  ))}
                </div>
              </div>
              {renderPage(tabs, path, page)}
            </div>
          </main>
        </div>
      </TabBarContext.Provider>
    </SideBarProvider>
  );
};
export {TabBarContext, DynamicLayout};
