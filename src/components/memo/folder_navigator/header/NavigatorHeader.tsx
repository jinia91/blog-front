import NewMemo from '@/components/memo/folder_navigator/header/NewMemoLink'
import NewFolder from '@/components/memo/folder_navigator/header/NewFolder'
import { Search } from '@/components/memo/folder_navigator/header/Search'
import React, { useContext, useState } from 'react'
import { type FolderInfo } from '@/api/models'
import ReferenceSystem from '@/components/memo/folder_navigator/header/ReferenceSystem'
import { usePathname } from 'next/navigation'
import { ReferenceModeContext } from '@/components/memo/folder_navigator/MemoEditContextProvider'

export default function NavigatorHeader ({ folders, setFolders }: {
  folders: FolderInfo[]
  setFolders: React.Dispatch<React.SetStateAction<FolderInfo[]>>
}): React.ReactElement {
  const [isSearchInputVisible, setSearchInputVisible] = useState(false)
  const { isReferenceMode, setReferenceMode, refreshCount }: {
    isReferenceMode: boolean
    setReferenceMode: React.Dispatch<React.SetStateAction<boolean>>
    refreshCount: number
  } = useContext(ReferenceModeContext)
  const pathname = usePathname()
  const isMemoTab = pathname.startsWith('/memo/')

  return (
    <div className={'flex p-2 flex-row-reverse border-t-2 border-l-2 border-r-2 bg-gray-900 '}>
      {!isSearchInputVisible && !isReferenceMode && (
        <>
          <NewMemo name="new" foldersRef={folders} setFoldersRef={setFolders}/>
          <NewFolder foldersRef={folders} setFoldersRef={setFolders}/>
        </>
      )}
      {!isSearchInputVisible && isMemoTab && (
        <ReferenceSystem
          foldersRef={folders}
          setFoldersRef={setFolders}
          isReferenceMode={isReferenceMode}
          setReferenceMode={setReferenceMode}
          refreshCount={refreshCount}
        />
      )}
      {
        !isReferenceMode && <Search
          foldersRef={folders}
          setFoldersRef={setFolders}
          isInputVisible={isSearchInputVisible}
          setInputVisible={setSearchInputVisible}
        />
      }
    </div>
  )
}
