
import React, { useRef, useEffect } from 'react';
import {Tab, TabItem} from "@/components/tapbar/TabItem";

export function ScrollingTabContainer({ tabs, selectedTabIdx, onSelectTab, onRemoveTab, onContextMenu } : {
  tabs: Tab[],
  selectedTabIdx: number,
  onSelectTab: (index: number) => void,
  onRemoveTab: (index: number) => void,
  onContextMenu: (event: React.MouseEvent<HTMLDivElement>, index: number) => void,
}){
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.offsetWidth;
      const selectedTabElement = scrollContainerRef.current.children[selectedTabIdx] as HTMLDivElement;
      
      if (selectedTabElement) {
        const selectedTabOffset = selectedTabElement.offsetLeft;
        const selectedTabWidth = selectedTabElement.offsetWidth;
        scrollContainerRef.current.scrollLeft = selectedTabOffset - (containerWidth / 2) + (selectedTabWidth / 2);
      }
    }
  }, [selectedTabIdx, tabs]);
  
  return (
    <div className="flex overflow-hidden space-x-2" style={{ zIndex: 1 }}>
      <div ref={scrollContainerRef} className="flex space-x-1 overflow-x-auto">
        {tabs.map((tab, idx) => (
          <TabItem
            tab={tab}
            index={idx}
            isSelected={idx === selectedTabIdx}
            onSelectTab={onSelectTab}
            onRemoveTab={onRemoveTab}
            onContextMenu={onContextMenu}
            key={idx}
          />
        ))}
      </div>
    </div>
  );
};
