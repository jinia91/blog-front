"use client";
import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import {FolderInfo} from "@/api/models";
import Image from "next/image";
import newMemo from "../../../public/newMemo.png";
import newFolder from "../../../public/newFolder.png";
import {deleteFolderById, deleteMemoById, fetchFolderAndMemo} from "@/api/memo";
import {TabBarContext} from "@/components/DynamicLayout";
import NewMemoLink from "@/components/link/NewMemoLink";
import MemoAndFolderContextMenu, {ContextMenuProps} from "@/components/memo/MemoAndFolderContextMenu";
import {afterDeleteMemoInFolders, updateTitleInFolders} from "@/components/memo/FolderSystemUtils";
import {FolderAndMemo} from "@/components/memo/FolderAndMemoStructure";
import NewFolder from "@/components/memo/NewFolder";


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
  
  const [memoContextMenu, setMemoContextMenu] = useState<ContextMenuProps | null>(null);
  const closeContextMenu = useCallback(() => {
    setMemoContextMenu(null);
  }, []);
  
  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLLIElement>, memoId?: string, folderId?: string) => {
    event.preventDefault();
    setMemoContextMenu({
      xPos: `${event.pageX}px`,
      yPos: `${event.pageY}px`,
      memoId: memoId,
      folderId: folderId
    });
    console.log("debug point", memoId, folderId)
  }, []);
  
  useEffect(() => {
    document.addEventListener('click', closeContextMenu);
    return () => {
      document.removeEventListener('click', closeContextMenu);
    };
  }, [closeContextMenu]);
  
  const handleDeleteClick = async () => {
    if (memoContextMenu && memoContextMenu.memoId) {
      await deleteMemo();
    } else if (memoContextMenu && memoContextMenu.folderId) {
      await deleteFolder();
    }
  }
  
  async function deleteFolder() {
    if (!memoContextMenu || !memoContextMenu.folderId) return;
   
    const result = await deleteFolderById(memoContextMenu.folderId);
    if (result) {
      const newFetchedFolders = await fetchFolderAndMemo()
      setFolderRef(newFetchedFolders);
      
      const newTabs = tabs.filter((tab : any) => {
        const memoId = tab.context.startsWith("/memo/") ? tab.context.split("/")[2] : null;
        
        return !memoId ||
        newFetchedFolders.some((folder : FolderInfo) => folderContainsMemo(folder, memoId));
      });
      setTabs(newTabs);

      if (selectedTabIdx !== null && !newTabs[selectedTabIdx]) {
        const newSelectedTabIdx = newTabs.length > 0 ? newTabs.length - 1 : null;
        setSelectedTabIdx(newSelectedTabIdx);
      }
      closeContextMenu();
    }
  }
  
  function folderContainsMemo(folder : FolderInfo, memoId : string): boolean {
    if (folder.memos.some(memo => memo.id.toString() === memoId)) return true;
    return folder.children && folder.children.some(childFolder => folderContainsMemo(childFolder, memoId));
  }
  
  async function deleteMemo() {
    if (!memoContextMenu || !memoContextMenu.memoId) return;
    const result = await deleteMemoById(memoContextMenu.memoId);
    if (result) {
      const newFolderStructure = afterDeleteMemoInFolders(FolderRef, memoContextMenu.memoId);
      setFolderRef(newFolderStructure);
      const deletedTabIndex = tabs.findIndex(function (tab: any) {
        if (tab.context.startsWith("/memo/")) {
          const memoId = tab.context.split("/")[2];
          return memoId === memoContextMenu.memoId;
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
  
  return (
    <div className={className}>
      <div className={"flex p-2 flex-row-reverse border-t-2 border-l-2 border-r-2"}>
        {/*폴더 생성으로 변경*/}
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
        
        <NewFolder name="new" foldersRef={FolderRef} setFoldersRef={setFolderRef}>
          <button
            className="text-white ml-3 mr-3"
            aria-label='newMemo'
            type='button'
          >
            <Image src={newFolder} alt={"newMemo"}
                   className={"white-image"}
                   width={30} height={30}/>
          </button>
        </NewFolder>
      </div>
      {MemoAndFolderContextMenu({contextMenu: memoContextMenu, closeContextMenu, handleDeleteClick})}
      <FolderAndMemo
        folders={FolderRef}
        handleContextMenu={handleContextMenu}
        contextMenu={memoContextMenu}
        underwritingId={underwritingId}
        newMemoTitle={newMemoTitle}
      />
    </div>
  );
}
