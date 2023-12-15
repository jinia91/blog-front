import {SimpleMemoInfo} from "@/api/models";
import React from "react";
import Image from "next/image";
import memoImg from "../../../public/memo.png";
import {MemoContextMenuProps} from "@/components/memo/MemoContextMenu";

export default function MemoItem({ memo, handleMemoContextMenu, depth, underwritingId, newMemoTitle, memoContextMenu } :{
  memo: SimpleMemoInfo,
  handleMemoContextMenu: (e: React.MouseEvent<HTMLLIElement, MouseEvent>, memoId: string) => void
  depth: number,
  underwritingId: string | null | undefined,
  newMemoTitle: string,
  memoContextMenu: MemoContextMenuProps | null
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
      onContextMenu={(e) => handleMemoContextMenu(e, memo.id.toString())}
      data-memo-id={memo.id.toString()}
      className={`pl-2 flex items-center pr-2 py-1 rounded cursor-pointer truncate h-8 hover:bg-gray-500 ${memo.id.toString() === underwritingId
        ? 'bg-gray-600' : 'hover:bg-gray-500'} ${memoContextMenu && memoContextMenu.memoId === memo.id.toString()
        ? 'bg-gray-600' : ''}`}
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
