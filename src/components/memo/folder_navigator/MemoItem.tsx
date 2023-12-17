import {SimpleMemoInfo} from "@/api/models";
import React, {useContext, useState} from "react";
import Image from "next/image";
import memoImg from "../../../../public/memo.png";
import {ContextMenuProps} from "@/components/memo/folder_navigator/MemoAndFolderContextMenu";
import {makeRelationshipWithFolders, makeRelationshipWithMemoAndFolders} from "@/api/memo";
import {MemoEditContext} from "@/components/memo/MemoFolderContainer";

export default function MemoItem({memo, handleContextMenu, depth, contextMenu}: {
  memo: SimpleMemoInfo,
  handleContextMenu: (e: React.MouseEvent<HTMLLIElement>, memoId?: string, folderId?: string) => void
  depth: number,
  contextMenu: ContextMenuProps | null
}) {
  const {underwritingId, underwritingTitle} = useContext(MemoEditContext);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const handleDragStart = (e: React.DragEvent, draggedItem: any) => {
    e.dataTransfer.setData('application/reactflow', JSON.stringify(draggedItem));
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDrop = async (e: React.DragEvent, targetFolderId: number | null) => {
    e.preventDefault();
    setIsDragOver(false);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };
  
  function determineMemoText(memo: SimpleMemoInfo, underwritingId: string | null | undefined, newMemoTitle: string | null) {
    if (memo.id.toString() === underwritingId) {
      return newMemoTitle?.length === 0 ? 'Untitled' : newMemoTitle;
    } else {
      return memo.title.length === 0 ? 'Untitled' : memo.title;
    }
  }
  
  return (
    <li
      draggable={true}
      onDragStart={(e) => handleDragStart(e, {id: memo.id, type: 'memo'})}
      onDrop={(e) => handleDrop(e, memo.id)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onContextMenu={(e) => handleContextMenu(e, memo.id.toString())}
      data-memo-id={memo.id.toString()}
      className={`
      pl-2 flex items-center pr-2 py-1 rounded cursor-pointer truncate h-8 hover:bg-gray-500
      ${memo.id.toString() === underwritingId ? 'bg-gray-600' : 'hover:bg-gray-500'}
      ${contextMenu && contextMenu.memoId === memo.id.toString() ? 'bg-gray-600' : ''}
      `}
    >
      <div
        className={"flex items-center"}
        style={{marginLeft: `${(depth + 1) * 20}px`}}
      >
        <Image src={memoImg} alt={"memo"} width={20} height={10}/>
        <span className="ml-2">{determineMemoText(memo, underwritingId, underwritingTitle)}</span>
      </div>
    </li>
  );
};
