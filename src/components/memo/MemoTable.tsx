"use client";
import React, {useEffect, useRef, useState} from "react";
import TabLink from "@/components/TabLink";
import {Memo} from "@/domain/Memo";
import {setLocalStorage} from "@/utils/LocalStorage";
import Image from "next/image";
import newMemo from "../../../public/newMemo.png";

export default function MemoTable({memos, underwritingId, underwritingTitle, className}: {
  memos: Memo[],
  underwritingId?: string | null,
  underwritingTitle?: string,
  className?: string
}) {
  
  const [newMemoTitle, setNewMemoTitle] = useState<string | null>(underwritingTitle ?? null);
  const listRef = useRef<HTMLUListElement>(null);
  
  useEffect(() => {
    setNewMemoTitle(underwritingTitle ?? null);
  }, [underwritingTitle]);
  
  const scrollToCenter = () => {
    if (listRef.current) {
      const selectedMemoElement = listRef.current.querySelector(`[data-memo-id="${underwritingId}"]`) as HTMLDivElement;
      if (selectedMemoElement) {
        const listHeight = listRef.current.offsetHeight;
        const memoPosition = selectedMemoElement.offsetTop;
        const memoHeight = selectedMemoElement.offsetHeight;
        const centerPosition = memoPosition - (listHeight / 2) + (memoHeight / 2);
        
        listRef.current.scrollTop = centerPosition;
      }
    }
  };
  
  useEffect(() => {
    scrollToCenter();
  }, [memos, underwritingId]);
  
  
  const hasUnderwritingMemo = memos.some(memo => memo.memoId.toString() === underwritingId);
  
  return (
    <div className={className}>
      <div className={"flex pb-3 flex-row-reverse"}>
        <TabLink name="new" href="/memo/new">
          <button
            className="text-white"
            aria-label='newMemo'
            type='button'
          
          >
            <Image src={newMemo} alt={"newMemo"}
                   className={"white-image"}
                   width={30} height={30}/>
          </button>
        </TabLink>
      </div>
      <ul ref={listRef} className="flex-grow overflow-auto text-white border-2 bg-gray-900">
        {memos.map((memo, index) => (
          <TabLink key={index} name={memo.title} href={`/memo/${memo.memoId}`}>
            <li
              data-memo-id={memo.memoId.toString()}
              className={`p-2 rounded cursor-pointer truncate h-8 ${
                memo.memoId.toString() === underwritingId ? 'bg-gray-600' : 'hover:bg-gray-600'
              }`}
            >
              {memo.memoId.toString() === underwritingId ? newMemoTitle : memo.title}
            </li>
          </TabLink>
        ))}
        
        {!hasUnderwritingMemo && underwritingId !== undefined && (
          <li className="p-2 bg-gray-600 rounded cursor-pointer truncate">
            {newMemoTitle?.length === 0 ? '새로운 메모를 작성해주세요' : newMemoTitle}
          </li>
        )}
      </ul>
    </div>
  );
}
