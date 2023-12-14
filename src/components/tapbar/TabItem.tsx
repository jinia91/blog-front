import React from "react";
import Link from "next/link";

export interface Tab {
  name: string;
  context: string;
}

export const TabItem = ({tab, index, isSelected, onSelectTab, onRemoveTab, onContextMenu}: {
  tab: { name: string, context: string },
  index: number,
  isSelected: boolean,
  onSelectTab: (index: number) => void,
  onRemoveTab: (index: number) => void,
  onContextMenu: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => void
}) => (
  <div
    onContextMenu={(e) => onContextMenu(e, index)}
    className="flex-shrink-0 w-32 relative"
  >
    <Link
      href={tab.context}
      onClick={() => onSelectTab(index)}
      className={`flex items-center justify-center p-2 rounded-t-lg ${isSelected ? 'bg-gray-700' : 'bg-gray-900'} hover:bg-gray-700 cursor-pointer`}
    >
      <span className={`dos-font truncate ${isSelected ? 'text-white' : 'text-gray-300'}`}>
        {tab.name}
      </span>
    </Link>
    <button
      onClick={() => onRemoveTab(index)}
      className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center w-3 h-3"
      style={{transform: 'translate(-50%, 50%)'}}
    />
  </div>
);
