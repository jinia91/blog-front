import React from 'react'

export interface ContextMenuProps {
  xPos: string
  yPos: string
  memoId?: string
  folderId?: string
  folderName?: string
}

export default function MemoFolderContextMenu ({
  contextMenu,
  closeContextMenu,
  handleDeleteClick,
  handleRenameClick
}: {
  contextMenu: ContextMenuProps | null
  closeContextMenu: any
  handleDeleteClick: any
  handleRenameClick: any
}): React.ReactElement | null | undefined {
  if (contextMenu === null) return null
  const onRenameClick = (): void => {
    if (contextMenu.folderId != null) {
      handleRenameClick(contextMenu.folderId, contextMenu.folderName)
      closeContextMenu()
    }
  }
  if (contextMenu.memoId != null) {
    return (
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
          <li className={'hover:bg-gray-700 p-1 list-none'} onClick={handleDeleteClick}>삭제하기</li>
        </ul>
      </>
    )
  } else if (contextMenu.folderId != null) {
    return (
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
          <li className={'hover:bg-gray-700 p-1 list-none'} onClick={onRenameClick}>이름변경하기</li>
          <li className={'hover:bg-gray-700 p-1 list-none'} onClick={handleDeleteClick}>삭제하기</li>
        </ul>
      </>
    )
  }
};
