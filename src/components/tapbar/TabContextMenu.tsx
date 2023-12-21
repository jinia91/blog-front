import React from 'react'

export interface TabContextMenuProps {
  xPos: string
  yPos: string
  tabIdx: number
}

export default function renderContextMenu (
  contextMenu: any,
  closeContextMenu: any,
  removeTabCallback: any,
  closeOtherTabs: any,
  closeAllTabs: any
): React.ReactNode {
  return (
    (contextMenu != null) && (
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
            zIndex: 1000
          }}
        >
          <li className={'hover:bg-gray-700 p-1 list-none'} onClick={removeTabCallback}>닫기</li>
          <li className={'hover:bg-gray-700 p-1 list-none'} onClick={closeOtherTabs}>다른 탭 닫기</li>
          <li className={'hover:bg-gray-700 p-1 list-none'} onClick={closeAllTabs}>모든 탭 닫기</li>
        </ul>
      </>
    ))
}
