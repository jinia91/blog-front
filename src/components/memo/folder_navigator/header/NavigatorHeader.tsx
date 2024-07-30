import NewFolder from '@/components/memo/folder_navigator/header/NewFolder'
import { Search } from '@/components/memo/folder_navigator/header/Search'
import React, { useContext, useState } from 'react'
import ReferenceSystem from '@/components/memo/folder_navigator/header/ReferenceSystem'
import { usePathname } from 'next/navigation'
import { ReferenceModeContext } from '@/components/memo/MemoEditContextProvider'
import NewMemoButton from '@/components/memo/folder_navigator/header/NewMemoButton'

export default function NavigatorHeader (): React.ReactElement {
  const [isSearchInputVisible, setSearchInputVisible] = useState(false)
  const { isReferenceMode, setReferenceMode, refreshCount }: {
    isReferenceMode: boolean
    setReferenceMode: React.Dispatch<React.SetStateAction<boolean>>
    refreshCount: number
  } = useContext(ReferenceModeContext)
  const pathname = usePathname()
  const isNotGraphPage = pathname.startsWith('/memo/')

  return (
    <div className={'flex p-2 flex-row-reverse border-t-2 border-l-2 border-r-2 bg-gray-900 '}>
      {!isSearchInputVisible && !isReferenceMode && (
        <>
          <NewMemoButton/>
          <NewFolder/>
        </>
      )}
      {!isSearchInputVisible && isNotGraphPage && (
        <ReferenceSystem
          isReferenceMode={isReferenceMode}
          setReferenceMode={setReferenceMode}
          refreshCount={refreshCount}
        />
      )}
      {
        !isReferenceMode && <Search
          isInputVisible={isSearchInputVisible}
          setInputVisible={setSearchInputVisible}
        />
      }
    </div>
  )
}
