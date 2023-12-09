"use client";
import React, {useEffect, useRef, useState} from "react";
import TabLink from "@/components/TabLink";
import {Memo} from "@/domain/Memo";
import {setLocalStorage} from "@/utils/LocalStorage";

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
  
  const saveScrollPosition = () => {
    if (listRef.current) {
      const scrollPosition = listRef.current.scrollTop;
      setLocalStorage('scrollPosition', JSON.stringify(scrollPosition));
    }
  };
  
  const restoreScrollPosition = () => {
    const savedPosition = localStorage.getItem('scrollPosition');
    if (listRef.current && savedPosition) {
      const scrollPosition = JSON.parse(savedPosition);
      listRef.current.scrollTop = scrollPosition;
    }
  };
  
  useEffect(() => {
    restoreScrollPosition();
    const listElement = listRef.current;
    listElement?.addEventListener('scroll', saveScrollPosition);
    return () => {
      listElement?.removeEventListener('scroll', saveScrollPosition);
    };
  }, []);
  
  const hasUnderwritingMemo = memos.some(memo => memo.memoId.toString() === underwritingId);
  
  return (
    <div className={className}>
      <ul ref={listRef} className="flex-grow overflow-auto text-white border-2">
        {memos.map((memo, index) => (
          <TabLink key={index} name={memo.title} href={`/memo/${memo.memoId}`}>
            <li
              data-memo-id={memo.memoId.toString()}
              className={`p-2 rounded cursor-pointer border-b ${
                memo.memoId.toString() === underwritingId ? 'bg-gray-600' : 'hover:bg-gray-600'
              }`}
            >
              {memo.memoId.toString() === underwritingId ? newMemoTitle : memo.title}
            </li>
          </TabLink>
        ))}
        
        {!hasUnderwritingMemo && underwritingId !== undefined && (
          <li className="p-2 bg-gray-600 rounded cursor-pointer border-b">
            {newMemoTitle?.length === 0 ? '새로운 메모를 작성해주세요' : newMemoTitle}
          </li>
        )}
        <button className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded">
          <TabLink name="new" href="/memo/new">
            newMemo
          </TabLink>
        </button>
      </ul>
    </div>
  );
}
