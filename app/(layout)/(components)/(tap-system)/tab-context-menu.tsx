'use client'
import React from 'react'
import { useContextMenu } from '../../(usecase)/tab-context-menu-usecases'
import { useTabBarAndRouter } from '../../(usecase)/tab-usecases'

export interface TabContextMenuProps {
  xPos: string
  yPos: string
  tabIdx: number
}

export default function TabContextMenu (): React.ReactNode {
  const { contextMenu, closeContextMenu } = useContextMenu()
  const { closeOtherTabsWithOut, closeAllTabs, closeTab } = useTabBarAndRouter()

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
          <li className={'hover:bg-gray-700 p-1 list-none'} onClick={() => {
            closeTab(contextMenu.tabIdx)
            closeContextMenu()
          }}>닫기
          </li>
          <li className={'hover:bg-gray-700 p-1 list-none'} onClick={() => {
            closeOtherTabsWithOut(contextMenu.tabIdx)
            closeContextMenu()
          }}>다른 탭 닫기
          </li>
          <li className={'hover:bg-gray-700 p-1 list-none'} onClick={() => {
            closeAllTabs()
            closeContextMenu()
          }}>모든 탭 닫기
          </li>
        </ul>
      </>
    ))
}
