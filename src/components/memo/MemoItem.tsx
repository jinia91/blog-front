import {SimpleMemoInfo} from "@/api/models";
import React from "react";
import Image from "next/image";
import memoImg from "../../../public/memo.png";
import {ContextMenuProps} from "@/components/memo/MemoAndFolderContextMenu";

export default function MemoItem({memo, handleContextMenu, depth, underwritingId, newMemoTitle, contextMenu}: {
  memo: SimpleMemoInfo,
  handleContextMenu: (e: React.MouseEvent<HTMLLIElement>, memoId?: string, folderId?: string) => void
  depth: number,
  underwritingId: string | null | undefined,
  newMemoTitle: string,
  contextMenu: ContextMenuProps | null
}) {
  function determineMemoText(memo: SimpleMemoInfo, underwritingId: string | null | undefined, newMemoTitle: string | null) {
    if (memo.id.toString() === underwritingId) {
      return newMemoTitle?.length === 0 ? 'Untitled' : newMemoTitle;
    } else {
      return memo.title.length === 0 ? 'Untitled' : memo.title;
    }
  }
  
  return (
    <li
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
        <span className="ml-2">{determineMemoText(memo, underwritingId, newMemoTitle)}</span>
      </div>
    </li>
  );
};
