import NewFolder from '@/components/memo/memo-system-navigator/header/NewFolder'
import { Search } from '@/components/memo/memo-system-navigator/header/Search'
import React, { useState } from 'react'
import ReferenceSystem from '@/components/memo/memo-system-navigator/header/ReferenceSystem'
import { usePathname } from 'next/navigation'
import NewMemoButton from '@/components/memo/memo-system-navigator/header/NewMemoButton'
import { useMemoSystem } from '@/memo/application/usecase/memo-system-usecases'

export default function NavigatorHeader (): React.ReactElement {
  const [isSearchInputVisible, setSearchInputVisible] = useState(false)
  const { navigatorContext } = useMemoSystem()
  const pathname = usePathname()
  const isNotGraphPage = pathname.startsWith('/memo/')

  return (
    <div className={'flex p-2 flex-row-reverse border-t-2 border-l-2 border-r-2 bg-gray-900 '}>
      {!isSearchInputVisible && !navigatorContext.isReferenceMode && (
        <>
          <NewMemoButton/>
          <NewFolder/>
        </>
      )}
      {!isSearchInputVisible && isNotGraphPage && (
        <ReferenceSystem/>
      )}
      {
        !navigatorContext.isReferenceMode && <Search
          isInputVisible={isSearchInputVisible}
          setInputVisible={setSearchInputVisible}
        />
      }
    </div>
  )
}
