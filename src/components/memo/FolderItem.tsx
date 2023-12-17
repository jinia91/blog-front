import {FolderInfo} from "@/api/models";
import folderImg from '../../../public/emptyFolder.png'
import folderWithContentImg from '../../../public/contentFolder.png'
import Image from "next/image";
import React, {useEffect, useRef, useState} from "react";
import {ContextMenuProps} from "@/components/memo/MemoAndFolderContextMenu";
import {makeRelationshipWithFolders, makeRelationshipWithMemoAndFolders} from "@/api/memo";

export default function FolderItem({
                                     folder,
                                     toggleFolder,
                                     depth,
                                     handleContextMenu,
                                     contextMenu,
                                     renamingFolderId,
                                     newFolderName,
                                     setNewFolderName,
                                     handleSubmitRename,
                                     refreshFunction
                                   }: {
  folder: FolderInfo;
  toggleFolder: (folderId: number) => void;
  depth: number;
  handleContextMenu: (e: React.MouseEvent<HTMLLIElement>, memoId?: string, folderId?: string, folderName?: string) => void;
  contextMenu: ContextMenuProps | null;
  renamingFolderId: string | null;
  newFolderName: string;
  setNewFolderName: (newFolderName: string) => void;
  handleSubmitRename: () => void;
  refreshFunction: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const handleDragStart = (e: React.DragEvent, draggedItem: any) => {
    e.dataTransfer.setData('application/reactflow', JSON.stringify(draggedItem));
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleUnCategorizedContextMenu = (e: React.MouseEvent<HTMLLIElement>) => {
    e.preventDefault();
  }
  
  const handleDrop = async (e: React.DragEvent, targetFolderId: number | null) => {
    e.preventDefault();
    setIsDragOver(false);
    const draggedItem: {id: number, type: string} = JSON.parse(e.dataTransfer.getData('application/reactflow'));
    // API 호출 로직
    if (draggedItem.type === 'memo') {
      const result = await makeRelationshipWithMemoAndFolders(draggedItem.id.toString(), targetFolderId?.toString() ?? null);
      if (result) {
        refreshFunction();
      } else {
        console.log('fail');
      }
      return;
    } else if (draggedItem.type === 'folder') {
      const result = await makeRelationshipWithFolders(draggedItem.id.toString(), targetFolderId?.toString() ?? null);
      if (result) {
        refreshFunction();
      } else {
        console.log('fail');
      }
      return;
    }
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };
  
  useEffect(() => {
    if (folder.id?.toString() === renamingFolderId) {
      inputRef.current?.focus();
    }
  }, [renamingFolderId, folder.id]);
  
  const handleOutsideClick = (e: MouseEvent) => {
    const target = e.target as Node;
    if (inputRef.current && !inputRef.current.contains(target)) {
      setNewFolderName("");
      handleSubmitRename();
    }
  };
  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);
  
  if (folder.id?.toString() === renamingFolderId) {
    return (
      <li
        className="pl-2 flex items-center pr-2 py-1 rounded cursor-pointer truncate h-8 bg-gray-600"
        style={{marginLeft: `${depth * 20}px`}}
      >
        <div
          className={"flex items-center"}
          style={{marginLeft: `${depth * 20}px`}}
        >
          <Image
            src={(folder.children.length > 0 || folder.memos.length > 0) ? folderWithContentImg : folderImg}
            alt={"folder"}
            width={20}
            height={20}
          />
          <input
            ref={inputRef}
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmitRename()}
            className="flex-grow ml-2 bg-gray-700 text-white rounded p-1 border-none focus:outline-none focus:ring-0"
          />
        </div>
      </li>
    );
  } else {
    return (
      <li
        draggable={true}
        onDragStart={(e) => handleDragStart(e, {id: folder.id, type: 'folder'})}
        onDrop={(e) => handleDrop(e, folder.id)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`pl-2 flex items-center pr-2 py-1 rounded cursor-pointer truncate h-8 hover:bg-gray-500
        ${isDragOver ? 'bg-gray-500' : ''}
      ${contextMenu && contextMenu.folderId && contextMenu.folderId === folder.id?.toString() ? 'bg-gray-600' : ''}`}
        onContextMenu={(e) => folder.id === null
          ? handleUnCategorizedContextMenu(e)
          : handleContextMenu(e, undefined, folder.id!!.toString(), folder.name)}
        onClick={() => toggleFolder(folder.id ?? 0)}
      >
        <div
          className={"flex items-center"}
          style={{marginLeft: `${depth * 20}px`}}
        >
          <Image
            src={(folder.children.length > 0 || folder.memos.length > 0) ? folderWithContentImg : folderImg}
            alt={"folder"}
            width={20}
            height={20}
          />
          <span className="ml-2">{folder.name}</span>
        </div>
      </li>
    );
  }
};
