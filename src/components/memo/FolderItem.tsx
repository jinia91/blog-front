import {FolderInfo} from "@/api/models";
import folderImg from '../../../public/emptyFolder.png'
import folderWithContentImg from '../../../public/contentFolder.png'
import Image from "next/image";
import React from "react";
import {ContextMenuProps} from "@/components/memo/MemoAndFolderContextMenu";

export default function FolderItem({folder, toggleFolder, depth, handleContextMenu, contextMenu}: {
  folder: FolderInfo;
  toggleFolder: (folderId: number) => void;
  depth: number;
  handleContextMenu: (e: React.MouseEvent<HTMLLIElement>, memoId?: string, folderId?: string) => void;
  contextMenu: ContextMenuProps | null;
}) {
  
  return (
    <li
      className={`pl-2 flex items-center pr-2 py-1 rounded cursor-pointer truncate h-8 hover:bg-gray-500
      ${contextMenu && contextMenu.folderId && contextMenu.folderId === folder.id?.toString() ? 'bg-gray-600' : ''}`}
      onContextMenu={(e) => folder.id === null
        ? null
        : handleContextMenu(e, undefined, folder.id!!.toString())}
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
};
