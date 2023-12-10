"use client";
import React, {createContext, useCallback, useEffect, useRef, useState} from "react";
import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";

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
const initialValue = {isCollapsed: true};
const SidebarContext: React.Context<any> = createContext(initialValue);

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
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.offsetWidth;
      
      const selectedTabElement : HTMLDivElement = scrollContainerRef.current.children[selectedTabIdx] as HTMLDivElement;;
      
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
  
  const [isCollapsed, setCollapse] = useState(true);
  
  const toggleSideBarCollapse = () => {
    setCollapse((prevState) => !prevState);
  };
  
  const renderOverlay = () => (
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
            className="p-3 context-menu bg-gray-800 text-white rounded-md shadow-lg overflow-hidden"
            style={{
              position: 'absolute',
              left: contextMenu.xPos,
              top: contextMenu.yPos,
              zIndex: 1000,
            }}
          >
            <li className={"hover:bg-gray-700 p-1"} onClick={closeOtherTabs}>현재탭만 제외하고 모든 탭 닫기</li>
            <li className={"hover:bg-gray-700 p-1"} onClick={closeAllTabs}>모든 탭 닫기</li>
          </ul>
        </>
      ))
  ;
  
  return (
    <SidebarContext.Provider value={{isCollapsed, toggleSideBarCollapse}}>
      <TabBarContext.Provider value={{tabs, selectedTabIdx, setTabs, setSelectedTabIdx}}>
        
        <header className="sticky top-0 w-full dark:bg-gray-900 border-b">{topNav}</header>
        
        <div className="md:flex overflow-hidden">
          <aside className="fixed md:static flex-1 h-screen bg-white dark:bg-gray-900 border-r" style={{zIndex: 1000}}>
            {sideBar}
          </aside>
          <main
            className="p-1 flex-grow bg-white dark:bg-gray-800 text-black dark:text-white w-screen h-screen overflow-auto">
            {renderOverlay()}
            <div className="bg-gray-800 p-4">
              {/*탭 컨테이너*/}
              <div className="flex overflow-hidden space-x-2" style={{zIndex: 1}}>
                <div ref={scrollContainerRef} className="flex space-x-1 overflow-x-auto">
                  {tabs.map((tab, idx) => (
                    <div
                      onContextMenu={(e) => handleContextMenu(e, idx)}
                      key={idx}
                      className="flex-shrink-0 w-32 relative"
                    >
                      <Link href={tab.context} onClick={() => selectTab(idx)}
                            className={`flex items-center justify-center p-2 rounded-t-lg ${selectedTabIdx === idx ? 'bg-gray-700' : 'bg-gray-900'} hover:bg-gray-700 cursor-pointer`}
                      >
                        <span className={`dos-font truncate ${selectedTabIdx === idx ? 'text-white' : 'text-gray-300'}`}>
                         {tab.name}
                        </span>
                      </Link>
                      <button
                        onClick={() => {
                          removeTab(idx);
                        }}
                        className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center w-3 h-3"
                        style={{transform: 'translate(-50%, 50%)'}}
                      >
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              {/*page 영역*/}
              {
                tabs.length > 0 && (path !== "/empty") && (
                  <div className="bg-gray-700 p-4 rounded-b-lg">
                    {page}
                  </div>
                )
              }
            </div>
          </main>
        </div>
      </TabBarContext.Provider>
    </SidebarContext.Provider>
  );
};
export {SidebarContext, TabBarContext, DynamicLayout};
