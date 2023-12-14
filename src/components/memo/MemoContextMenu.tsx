
export default function MemoContextMenu({ contextMenu, closeContextMenu, handleDeleteClick } : {
  contextMenu: any,
  closeContextMenu: any,
  handleDeleteClick: any
}) {
  if (!contextMenu) return null;
  
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
          zIndex: 1000,
        }}
      >
        <li className={"hover:bg-gray-700 p-1 list-none"} onClick={handleDeleteClick}>삭제하기</li>
      </ul>
    </>
  );
};
