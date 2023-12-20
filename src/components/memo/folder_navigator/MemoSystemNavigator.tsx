"use client";
import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import {FolderInfo} from "@/api/models";
import {changeFolderName, deleteFolderById, deleteMemoById, fetchFolderAndMemo} from "@/api/memo";
import {TabBarContext} from "@/components/DynamicLayout";
import MemoAndFolderContextMenu, {ContextMenuProps} from "@/components/memo/folder_navigator/MemoAndFolderContextMenu";
import {
  rebuildMemoDeleted, folderContainsMemo,
  rebuildNewNameFolder,
  rebuildMemoTitle
} from "@/components/memo/folder_navigator/FolderSystemUtils";
import {FolderAndMemo} from "@/components/memo/folder_navigator/FolderAndMemoStructure";
import {FolderContext, MemoEditContext} from "@/components/memo/MemoFolderContainer";
import NavigatorHeader from "@/components/memo/folder_navigator/NavigatorHeader";


export default function MemoSystemNavigator({className}: { className?: string }) {
  const {folders, setFolders} = useContext(FolderContext)
  const {tabs, selectedTabIdx, setTabs, setSelectedTabIdx} = useContext(TabBarContext);
  const {underwritingTitle, underwritingId} = useContext(MemoEditContext);
  
  useEffect(() => {
    const newFolderRef = rebuildMemoTitle(folders, underwritingId, underwritingTitle ?? "");
    setFolders(newFolderRef);
  }, [underwritingTitle]);
  
  const [memoContextMenu, setMemoContextMenu] = useState<ContextMenuProps | null>(null);
  const closeContextMenu = useCallback(() => {
    setMemoContextMenu(null);
  }, []);
  
  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLLIElement>, memoId?: string, folderId?: string, folderName?: string) => {
    event.preventDefault();
    setMemoContextMenu({
      xPos: `${event.pageX}px`,
      yPos: `${event.pageY}px`,
      memoId: memoId,
      folderId: folderId,
      folderName: folderName,
    });
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
  
  // 폴더명 변경 todo 적절한 컴포넌트로 이동
  const [renamingFolderId, setRenamingFolderId] = useState<string>('');
  const [newFolderName, setNewFolderName] = useState<string>('');
  
  const handleRenameClick = (folderId: string, currentName: string) => {
    setRenamingFolderId(folderId);
    setNewFolderName(currentName);
  };
  
  const handleSubmitRename = async () => {
    if (newFolderName === '') {
      setRenamingFolderId('');
    } else if (renamingFolderId) {
      const result = await changeFolderName(renamingFolderId, newFolderName);
      if (result) {
        const newFolderRef = rebuildNewNameFolder(folders, renamingFolderId, newFolderName);
        setRenamingFolderId('');
        setFolders(newFolderRef)
      }
    }
  };
  
  async function deleteFolder() {
    if (!memoContextMenu || !memoContextMenu.folderId) return;
    
    const result = await deleteFolderById(memoContextMenu.folderId);
    if (result) {
      const newFetchedFolders = await fetchFolderAndMemo()
      setFolders(newFetchedFolders);
      
      const newTabs = tabs.filter((tab: any) => {
        const memoId = tab.context.startsWith("/memo/") ? tab.context.split("/")[2] : null;
        
        return !memoId ||
          newFetchedFolders.some((folder: FolderInfo) => folderContainsMemo(folder, memoId));
      });
      setTabs(newTabs);
      
      if (selectedTabIdx !== null && !newTabs[selectedTabIdx]) {
        const newSelectedTabIdx = newTabs.length > 0 ? newTabs.length - 1 : null;
        setSelectedTabIdx(newSelectedTabIdx);
      }
      closeContextMenu();
    }
  }
  
  async function deleteMemo() {
    if (!memoContextMenu || !memoContextMenu.memoId) return;
    const result = await deleteMemoById(memoContextMenu.memoId);
    if (result) {
      const newFolderStructure = rebuildMemoDeleted(folders, memoContextMenu.memoId);
      setFolders(newFolderStructure);
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
      <NavigatorHeader folders={folders} setFolders={setFolders} />
      {MemoAndFolderContextMenu({contextMenu: memoContextMenu, closeContextMenu, handleDeleteClick, handleRenameClick})}
      <FolderAndMemo
        folders={folders}
        handleContextMenu={handleContextMenu}
        contextMenu={memoContextMenu}
        renamingFolderId={renamingFolderId}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        handleSubmitRename={handleSubmitRename}
      />
    </div>
  );
}
