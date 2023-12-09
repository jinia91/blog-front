"use client";
import React, {createContext, Suspense, useEffect, useRef, useState} from "react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useRouter} from 'next/navigation'

interface TabStatus {
  tabs: Tab[];
  selectedTabIdx: number;
}

interface Tab {
  name: string;
  context: string;
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
  const [isCollapsed, setCollapse] = useState(true);
  const initialTab = path !== "/empty" ? [{name: path, context: path}] : []
  const [tabs, setTabs] = React.useState<Tab[]>(initialTab);
  const [selectedTabIdx, setSelectedTabIdx] = React.useState<number>(0);
  const router = useRouter();
  
  useEffect(() => {
    const selectedTab = tabs[selectedTabIdx];
    if (selectedTab && selectedTab.context !== path) {
      router.push(selectedTab.context);
    }
    else if(tabs.length === 0){
      router.push('/empty');
    }
  }, [selectedTabIdx, tabs, path, router]);
  
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
  
  const toggleSideBarCollapse = () => {
    setCollapse((prevState) => !prevState);
  };
  
  return (
    <SidebarContext.Provider value={{isCollapsed, toggleSideBarCollapse}}>
      <TabBarContext.Provider value={{tabs, selectedTabIdx, setTabs, setSelectedTabIdx}}>
        
        <header className="sticky top-0 w-full dark:bg-gray-900 border-b">{topNav}</header>
        
        <div className="md:flex overflow-hidden">
          <aside className="fixed md:static flex-1 h-screen bg-white dark:bg-gray-900 border-r" style={{ zIndex: 1000 }}>
            {sideBar}
          </aside>
          <main
            className="p-1 flex-grow bg-white dark:bg-gray-800 text-black dark:text-white w-screen h-screen overflow-auto">
            <div className="bg-gray-800 p-4">
              {/*탭 컨테이너*/}
              <div className="flex overflow-hidden space-x-2" style={{ zIndex: 1 }}>
                <div className="flex space-x-1 overflow-x-auto">
                  {tabs.map((tab, idx) => (
                    <div key={idx} className="flex-shrink-0 w-32 relative">
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
