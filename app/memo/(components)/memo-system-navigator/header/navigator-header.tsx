import NewFolder from './new-folder'
import { MemoSearch } from './memo-search'
import React from 'react'
import NewMemo from './new-memo'

export default function NavigatorHeader ({ onCollapseAll, onToggleNavigator, onToggleBacklinks, backlinksVisible }: {
  onCollapseAll: () => void
  onToggleNavigator?: () => void
  onToggleBacklinks?: () => void
  backlinksVisible?: boolean
}): React.ReactElement {
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
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <span className="tooltip-message">닫기</span>
        </div>
      )}
      {/* Toggle Backlinks Button - 백링크가 닫혀있을 때만 표시 */}
      {onToggleBacklinks !== undefined && backlinksVisible === false && (
        <div className="tooltip">
          <button
            onClick={onToggleBacklinks}
            className="text-white hover:text-gray-300 ml-2"
            title="연관메모 패널 열기"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          </button>
          <span className="tooltip-message">연관메모</span>
        </div>
      )}
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
      <MemoSearch/>
    </div>
  )
}
