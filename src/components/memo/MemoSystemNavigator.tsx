"use client";
import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import TabLink from "@/components/TabLink";
import {FolderInfo} from "@/domain/Memo";
import Image from "next/image";
import newMemo from "../../../public/newMemo.png";
import {deleteMemoById} from "@/api/memo";
import {TabBarContext} from "@/components/DynamicLayout";
import NewMemoLink from "@/components/NewMemoLink";
import FolderItem from "@/components/memo/FolderItem";
import MemoItem from "@/components/memo/MemoItem";

export interface ContextMenuPosition {
  xPos: string;
  yPos: string;
  memoId: string;
}

export default function MemoSystemNavigator({foldersOrigin, underwritingId, underwritingTitle, className}: {
  foldersOrigin: FolderInfo[],
  underwritingId?: string,
  underwritingTitle?: string,
  className?: string
}) {
  const [newMemoTitle, setNewMemoTitle] = useState<string>(underwritingTitle ?? "");
  
  const listRef = useRef<HTMLUListElement>(null);
  
  const [FolderRef, setFolderRef] = useState<FolderInfo[]>(foldersOrigin);
  
  const {tabs, selectedTabIdx, setTabs, setSelectedTabIdx} = useContext(TabBarContext);
  
  const getInitialOpenFolders = () => {
    const storedOpenFolders = localStorage.getItem('openFolders');
    return storedOpenFolders ? new Set(JSON.parse(storedOpenFolders)) : new Set();
  };
  
  const [openFolders, setOpenFolders] = useState(getInitialOpenFolders);
  
  useEffect(() => {
    setNewMemoTitle(underwritingTitle ?? "");
    const newFolderRef: FolderInfo[] = FolderRef?.map((folder) => {
        const newMemos = folder.memos.map((memo) => {
          if (memo.memoId.toString() === underwritingId) {
            return {...memo, title: underwritingTitle ?? ""};
          } else {
            return memo;
          }
        });
        return {...folder, memos: newMemos};
      }
    );
    setFolderRef(newFolderRef);
  }, [underwritingTitle]);
  
  useEffect(() => {
    setFolderRef(foldersOrigin);
  }, [foldersOrigin]);
  
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
  }, [FolderRef, underwritingId, underwritingTitle]);
  
  // contextMenu
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(null);
  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);
  
  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLLIElement>, memoId: string) => {
    event.preventDefault();
    setContextMenu({
      xPos: `${event.pageX}px`,
      yPos: `${event.pageY}px`,
      memoId: memoId,
    });
  }, []);
  
  useEffect(() => {
    document.addEventListener('click', closeContextMenu);
    return () => {
      document.removeEventListener('click', closeContextMenu);
    };
  }, [closeContextMenu]);
  
  const filterFolders = (folders: FolderInfo[], deletedMemoId: string): FolderInfo[] => {
    return folders.reduce((acc: FolderInfo[], folder: FolderInfo) => {
      const filteredMemos = folder.memos.filter(memo => memo.memoId.toString() !== deletedMemoId);
      const updatedChildren = filterFolders(folder.children, deletedMemoId);
      const updatedFolder = {
        ...folder,
        memos: filteredMemos,
        children: updatedChildren
      };
      return [...acc, updatedFolder];
    }, []);
  };
  
  const handleDeleteClick = async () => {
    if (contextMenu && contextMenu.memoId) {
      const result = await deleteMemoById(contextMenu.memoId);
      if (result) {
        const newFolderStructure = filterFolders(FolderRef, contextMenu.memoId);
        setFolderRef(newFolderStructure);
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
  
  useEffect(() => {
    localStorage.setItem('openFolders', JSON.stringify(Array.from(openFolders)));
  }, [openFolders]);
  
  const renderItems = (folders: FolderInfo[], depth: number = 0) => {
    const toggleFolder = (folderId: number) => {
      setOpenFolders(prev => {
        const newSet = new Set(prev);
        if (newSet.has(folderId)) {
          newSet.delete(folderId);
        } else {
          newSet.add(folderId);
        }
        return newSet;
      });
    };
    
    return folders.map((folder) => (
      <React.Fragment key={folder.id}>
        <>
          <FolderItem folder={folder} toggleFolder={toggleFolder} depth={depth}/>
          {openFolders.has(folder.id ?? 0) && (
            <>
              {folder.memos.map((memo) => (
                <TabLink key={memo.memoId} href={`/memo/${memo.memoId}`}
                         name={memo.title !== '' ? memo.title : `/memo/${memo.memoId}`}>
                  <MemoItem
                    memo={memo}
                    handleContextMenu={handleContextMenu}
                    contextMenu={contextMenu}
                    depth={depth}
                    underwritingId={underwritingId}
                    newMemoTitle={newMemoTitle}
                  />
                </TabLink>
              ))}
              {folder.children.length > 0 && renderItems(folder.children, depth + 1)}
            </>
          )}
        </>
      </React.Fragment>
    ));
  };
  
  return (
    <div className={className}>
      <div className={"flex p-2 flex-row-reverse border-t-2 border-l-2 border-r-2"}>
        <NewMemoLink name="new" foldersRef={FolderRef} setFoldersRef={setFolderRef}>
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
        {renderItems(FolderRef)}
      </ul>
    </div>
  );
}
