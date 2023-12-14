"use client";
import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import TabLink from "@/components/TabLink";
import {Memo, SimpleMemoInfo} from "@/domain/Memo";
import Image from "next/image";
import newMemo from "../../../public/newMemo.png";
import {createMemo, deleteMemoById} from "@/api/memo";
import {TabBarContext} from "@/components/DynamicLayout";
import NewMemoLink from "@/components/NewMemoLink";
import {revalidateTag} from "next/cache";

interface ContextMenuPosition {
  xPos: string;
  yPos: string;
  memoId: string;
}

export default function MemoTable({memos, underwritingId, underwritingTitle, className}: {
  memos: SimpleMemoInfo[],
  underwritingId?: string,
  underwritingTitle?: string,
  className?: string
}) {
  const [newMemoTitle, setNewMemoTitle] = useState<string>(underwritingTitle ?? "");
  
  const listRef = useRef<HTMLUListElement>(null);
  
  const [memosRef, setMemosRef] = useState<SimpleMemoInfo[]>(memos);
  
  const {tabs, selectedTabIdx, setTabs, setSelectedTabIdx} = useContext(TabBarContext);
  
  useEffect(() => {
    setNewMemoTitle(underwritingTitle ?? "");
    const newMemoRef : SimpleMemoInfo[] = memosRef?.map((memo) => {
        if (memo.memoId.toString() === underwritingId) {
          const newMemo: SimpleMemoInfo = {memoId: memo.memoId, title: underwritingTitle ?? "", references: memo.references};
          return newMemo;
        } else {
          return memo;
        }
      }
    ) ?? [];
    setMemosRef(newMemoRef);
  }, [underwritingTitle]);
  
  useEffect(() => {
    setMemosRef(memos);
  }, [memos]);
  
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
  }, [memosRef, underwritingId, underwritingTitle]);
  
  // contextMenu
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(null);
  
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
    setHoveredIdx(null);
  }, []);
  
  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLLIElement>, idx: number, memoId: string) => {
    event.preventDefault();
    setContextMenu({
      xPos: `${event.pageX}px`,
      yPos: `${event.pageY}px`,
      memoId: memoId,
    });
    setHoveredIdx(idx);
  }, []);
  
  useEffect(() => {
    document.addEventListener('click', closeContextMenu);
    return () => {
      document.removeEventListener('click', closeContextMenu);
    };
  }, [closeContextMenu]);
  
  const handleDeleteClick = async () => {
    if (contextMenu && contextMenu.memoId) {
      const result = await deleteMemoById(contextMenu.memoId);
      if (result) {
        const newMemos = memosRef.filter(memo => memo.memoId.toString() !== contextMenu.memoId);
        setMemosRef(newMemos);
        const deletedTabIndex = tabs.findIndex(function (tab: any) {
          if (tab.context.startsWith("/memo/")) {
            const memoId = tab.context.split("/")[2];
            return memoId === contextMenu.memoId;
          }
        });
        if (deletedTabIndex !== -1) {
          const newTabs = tabs.filter(function (_: any, idx: number) {
            return idx !== deletedTabIndex;
          });
          setTabs(newTabs);
          
          if (selectedTabIdx === deletedTabIndex) {
            const newSelectedTabIdx = newTabs.length > 0 ? newTabs.length - 1 : null;
            setSelectedTabIdx(newSelectedTabIdx);
          } else if (selectedTabIdx > deletedTabIndex) {
            setSelectedTabIdx(selectedTabIdx - 1);
          }
        }
        closeContextMenu();
      }
    }
  }
  
  function determineMemoText(memo: SimpleMemoInfo, underwritingId: string | null | undefined, newMemoTitle: string | null) {
    if (memo.memoId.toString() === underwritingId) {
      return newMemoTitle?.length === 0 ? 'Untitled' : newMemoTitle;
    } else {
      return memo.title.length === 0 ? 'Untitled' : memo.title;
    }
  }
  
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
    ));
  
  return (
    <div className={className}>
      <div className={"flex pb-3 flex-row-reverse"}>
        <NewMemoLink name="new" memoRef={memosRef} setMemoRef={setMemosRef}>
          <button
            className="text-white"
            aria-label='newMemo'
            type='button'
          >
            <Image src={newMemo} alt={"newMemo"}
                   className={"white-image"}
                   width={30} height={30}/>
          </button>
        </NewMemoLink>
      </div>
      {renderOverlay()}
      <ul ref={listRef} className="flex-grow overflow-auto text-white border-2 bg-gray-900">
        {memosRef.map((memo, index) => (
          <TabLink key={index} name={memo.title !== '' ? memo.title : `/memo/${memo.memoId}`}
                   href={`/memo/${memo.memoId}`}>
            <li
              onContextMenu={(e) => handleContextMenu(e, index, memo.memoId.toString())}
              data-memo-id={memo.memoId.toString()}
              className={`p-2 rounded cursor-pointer truncate h-8 ${
                memo.memoId.toString() === underwritingId ? 'bg-gray-600' : 'hover:bg-gray-500'
              }
              ${hoveredIdx === index ? 'bg-gray-500' : ''}
              `}
            >
              {determineMemoText(memo, underwritingId, newMemoTitle)}
            </li>
          </TabLink>
        ))}
      </ul>
    </div>
  );
}
