import NewFolder from './new-folder'
import { MemoSearch } from './memo-search'
import React from 'react'
import ReferenceSystem from './reference-system'
import { usePathname } from 'next/navigation'
import NewMemo from './new-memo'
import { useMemoSystem } from '../../../(usecase)/memo-system-usecases'
import { NavigatorContextType } from '../../../(domain)/memo-system-navigator-context'

export default function NavigatorHeader ({ onCollapseAll, onToggleNavigator }: {
  onCollapseAll: () => void
  onToggleNavigator?: () => void
}): React.ReactElement {
  const { navigatorContext } = useMemoSystem()
  const pathname = usePathname()
  const isNotGraphPage = pathname.startsWith('/memo/')

  return (
    <div className={'flex p-2 flex-row-reverse border-t-2 border-l-2 border-r-2 bg-gray-900 items-center'}>
      {/* Toggle Navigator Button - rightmost */}
      {onToggleNavigator !== undefined && (
        <div className="tooltip">
          <button
            onClick={onToggleNavigator}
            className="text-white hover:text-gray-300 ml-2"
            title="탐색기 닫기"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="13 17 18 12 13 7"></polyline>
              <polyline points="6 17 11 12 6 7"></polyline>
            </svg>
          </button>
          <span className="tooltip-message">닫기</span>
        </div>
      )}
      {navigatorContext.type === NavigatorContextType.NORMAL_MODE && (
        <>
          <NewMemo/>
          <NewFolder/>
          <div className="tooltip mr-auto">
            <button
              onClick={onCollapseAll}
              className="text-white hover:text-gray-300 ml-2"
              title="모두 접기"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
            </button>
            <span className="tooltip-message">모두 접기</span>
          </div>
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
