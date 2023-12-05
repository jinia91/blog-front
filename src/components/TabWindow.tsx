"use client"

import React, {createContext} from "react";

interface TabStatus {
  tabs: Tab[];
  selectedTabIdx: number;
}

interface Tab {
  name: string;
  context: React.ReactNode;
}

const initialValue: TabStatus = {tabs: [], selectedTabIdx: 0};

const TabBarContext: React.Context<any> = createContext(initialValue);

const TabWindow = (initialTab: Tab) => {
  const [tabs, setTabs] = React.useState<Tab[]>([initialTab]);
  const [selectedTabIdx, setSelectedTabIdx] = React.useState<number>(0);
  
  const addTab = (name: string, context: React.ReactNode) => {
    const newTab: Tab = {name, context};
    setTabs([...tabs, newTab]);
    setSelectedTabIdx(tabs.length);
  };
  
  const selectTab = (index: number) => {
    setSelectedTabIdx(index);
  };
  
  const removeTab = (index: number) => {
    const newTabs = tabs.filter((_, idx) => idx !== index);
    setTabs(newTabs);
    setSelectedTabIdx(prevIdx => prevIdx > 0 ? prevIdx - 1 : 0);
  };
  
  return (
    <TabBarContext.Provider value={{tabs, selectedTabIdx, addTab, selectTab}}>
      <div className="bg-gray-800 p-4">
        <div className="flex space-x-2">
          {tabs.map((tab, idx) => (
            <div key={idx}
                 className={`flex items-center justify-between p-2 rounded-t-lg ${selectedTabIdx === idx ? 'bg-gray-700' : 'bg-gray-900'} hover:bg-gray-700 cursor-pointer pr-5 pl-5`}
                 onClick={() => selectTab(idx)}>
              <button
                onClick={() => removeTab(idx)}
                className="bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center w-4 h-4 text-center"
              >
              </button>

              <span className={`pl-4 ${selectedTabIdx === idx ? 'text-white' : 'text-gray-300'}`}>
                {tab.name}
              </span>
              
            </div>
          ))}
        </div>
        <div className="bg-gray-700 p-4 rounded-b-lg">
          {tabs[selectedTabIdx]?.context}
        </div>
      </div>
    </TabBarContext.Provider>
  );
};
export {TabBarContext, TabWindow};
