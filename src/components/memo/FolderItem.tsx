import {FolderInfo} from "@/api/models";
import folderImg from '../../../public/emptyFolder.png'
import folderWithContentImg from '../../../public/contentFolder.png'
import Image from "next/image";
import React, {useEffect, useRef} from "react";
import {ContextMenuProps} from "@/components/memo/MemoAndFolderContextMenu";

export default function FolderItem({folder, toggleFolder, depth, handleContextMenu, contextMenu, renamingFolderId, newFolderName, setNewFolderName, handleSubmitRename}: {
  folder: FolderInfo;
  toggleFolder: (folderId: number) => void;
  depth: number;
  handleContextMenu: (e: React.MouseEvent<HTMLLIElement>, memoId?: string, folderId?: string, folderName?: string) => void;
  contextMenu: ContextMenuProps | null;
  renamingFolderId: string | null;
  newFolderName: string;
  setNewFolderName: (newFolderName: string) => void;
  handleSubmitRename: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  
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
        className={`pl-2 flex items-center pr-2 py-1 rounded cursor-pointer truncate h-8 hover:bg-gray-500
      ${contextMenu && contextMenu.folderId && contextMenu.folderId === folder.id?.toString() ? 'bg-gray-600' : ''}`}
        onContextMenu={(e) => folder.id === null
          ? null
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
