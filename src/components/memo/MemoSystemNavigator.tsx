"use client";
import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import {FolderInfo} from "@/api/models";
import Image from "next/image";
import newMemo from "../../../public/newMemo.png";
import {deleteMemoById} from "@/api/memo";
import {TabBarContext} from "@/components/DynamicLayout";
import NewMemoLink from "@/components/NewMemoLink";
import MemoContextMenu, {ContextMenuProps} from "@/components/memo/MemoContextMenu";
import {deleteMemoInFolders, updateTitleInFolders} from "@/components/memo/FolderSystemUtils";
import {FolderAndMemo} from "@/components/memo/FolderAndMemoStructure";


export default function MemoSystemNavigator({foldersOrigin, underwritingId, underwritingTitle, className}: {
  foldersOrigin: FolderInfo[],
  underwritingId?: string,
  underwritingTitle?: string,
  className?: string
}) {
  const [FolderRef, setFolderRef] = useState<FolderInfo[]>(foldersOrigin);
  
  const {tabs, selectedTabIdx, setTabs, setSelectedTabIdx} = useContext(TabBarContext);
  
  const [newMemoTitle, setNewMemoTitle] = useState<string>(underwritingTitle ?? "");
  
  useEffect(() => {
    setNewMemoTitle(underwritingTitle ?? "");
    const newFolderRef = updateTitleInFolders(FolderRef, underwritingId, underwritingTitle ?? "");
    setFolderRef(newFolderRef);
  }, [underwritingTitle]);
  
  const [contextMenu, setContextMenu] = useState<ContextMenuProps | null>(null);
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
  
  const handleDeleteClick = async () => {
    if (contextMenu && contextMenu.memoId) {
      const result = await deleteMemoById(contextMenu.memoId);
      if (result) {
        const newFolderStructure = deleteMemoInFolders(FolderRef, contextMenu.memoId);
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
      {MemoContextMenu({contextMenu, closeContextMenu, handleDeleteClick})}
      <FolderAndMemo
        folders={FolderRef}
        handleContextMenu={handleContextMenu}
        contextMenu={contextMenu}
        underwritingId={underwritingId}
        newMemoTitle={newMemoTitle}
      />
    </div>
  );
}
