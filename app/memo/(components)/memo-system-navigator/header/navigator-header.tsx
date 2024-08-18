import NewFolder from './new-folder'
import { MemoSearch } from './memo-search'
import React from 'react'
import ReferenceSystem from './reference-system'
import { usePathname } from 'next/navigation'
import NewMemo from './new-memo'
import { useMemoSystem } from '../../../(usecase)/memo-system-usecases'
import { NavigatorContextType } from '../../../(domain)/memo-system-navigator-context'

export default function NavigatorHeader (): React.ReactElement {
  const { navigatorContext } = useMemoSystem()
  const pathname = usePathname()
  const isNotGraphPage = pathname.startsWith('/memo/')

  return (
    <div className={'flex p-2 flex-row-reverse border-t-2 border-l-2 border-r-2 bg-gray-900 '}>
      {navigatorContext.type === NavigatorContextType.NORMAL_MODE && (
        <>
          <NewMemo/>
          <NewFolder/>
        </>
      )}
      {navigatorContext.type !== NavigatorContextType.SEARCH_MODE && isNotGraphPage && (
        <ReferenceSystem/>
      )}
      {
        navigatorContext.type !== NavigatorContextType.REFERENCE_MODE && <MemoSearch/>
      }
    </div>
  )
}
