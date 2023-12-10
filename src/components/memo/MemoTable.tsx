"use client";
import React, {useCallback, useEffect, useRef, useState} from "react";
import TabLink from "@/components/TabLink";
import {Memo} from "@/domain/Memo";
import Image from "next/image";
import newMemo from "../../../public/newMemo.png";

interface ContextMenuPosition {
  xPos: string;
  yPos: string;
}

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
      } else {
        listRef.current.scrollTop = listRef.current.offsetHeight;
      }
    }
  };
  
  useEffect(() => {
    scrollToCenter();
  }, [memos, underwritingId]);
  
  // contextMenu
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(null);
  
  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);
  
  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLLIElement>, idx: number) => {
    event.preventDefault();
    setContextMenu({
      xPos: `${event.pageX}px`,
      yPos: `${event.pageY}px`,
    });
  }, []);
  
  useEffect(() => {
    document.addEventListener('click', closeContextMenu);
    return () => {
      document.removeEventListener('click', closeContextMenu);
    };
  }, [closeContextMenu]);
  
  
  const hasUnderwritingMemo = memos.some(memo => memo.memoId.toString() === underwritingId);
  
  const renderOverlay = () => (
    contextMenu && (
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
          className="p-3 context-menu bg-gray-800 text-white rounded-md shadow-lg overflow-hidden"
          style={{
            position: 'absolute',
            left: contextMenu.xPos,
            top: contextMenu.yPos,
            zIndex: 1000,
          }}
        >
          <li className={"hover:bg-gray-700 p-1"}>삭제하기</li>
        </ul>
      </>
    ))
  ;
  
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
      {renderOverlay()}
      <ul ref={listRef} className="flex-grow overflow-auto text-white border-2 bg-gray-900">
        {memos.map((memo, index) => (
          <TabLink key={index} name={memo.title} href={`/memo/${memo.memoId}`}>
            <li
              onContextMenu={(e) => handleContextMenu(e, index)}
              data-memo-id={memo.memoId.toString()}
              className={`p-2 rounded cursor-pointer truncate h-8 ${
                memo.memoId.toString() === underwritingId ? 'bg-gray-600' : 'hover:bg-gray-500'
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
