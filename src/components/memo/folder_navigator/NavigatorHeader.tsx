import NewMemoLink from "@/components/memo/folder_navigator/NewMemoLink";
import NewFolder from "@/components/memo/folder_navigator/NewFolder";
import {Search} from "@/components/memo/folder_navigator/Search";
import React, {useState} from "react";
import {FolderInfo} from "@/api/models";

export default function NavigatorHeader({folders, setFolders}: {
  folders: FolderInfo[],
  setFolders: React.Dispatch<React.SetStateAction<FolderInfo[]>>
}) {
  const [isInputVisible, setInputVisible] = useState(false);
  
  return (
    <div className={"flex p-2 flex-row-reverse border-t-2 border-l-2 border-r-2 bg-gray-900 "}>
      {!isInputVisible && (
        <>
          <NewMemoLink name="new" foldersRef={folders} setFoldersRef={setFolders}/>
          <NewFolder foldersRef={folders} setFoldersRef={setFolders}/>
        </>
      )}
      <Search
        foldersRef={folders}
        setFoldersRef={setFolders}
        isInputVisible={isInputVisible}
        setInputVisible={setInputVisible}
      />
    </div>
  )
}
