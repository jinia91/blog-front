'use client'

import React from 'react'
import { useFolderAndMemo } from '../../(usecase)/memo-folder-usecases'
import { useMemoSystem } from '../../(usecase)/memo-system-usecases'
import { type BreadcrumbItem, folderFinder } from '../../(domain)/folder'
import { useOpenFolders } from '../../(usecase)/memo-navigator-usecases'

export function MemoBreadcrumb (): React.ReactElement {
  const { folders } = useFolderAndMemo()
  const { memoEditorSharedContext } = useMemoSystem()
  const { openFolder } = useOpenFolders()

  const breadcrumbPath: BreadcrumbItem[] = folderFinder.findFolderPathToMemoId(folders, memoEditorSharedContext.id)

  const handleFolderClick = (folderId: number | null): void => {
    // uncategorized folder uses id 0 internally
    const id = folderId ?? 0
    openFolder(id)
  }

  if (breadcrumbPath.length === 0) {
    return <div className="text-xs text-gray-500 mb-1">/</div>
  }

  return (
    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1 overflow-x-auto">
      <span>/</span>
      {breadcrumbPath.map((item, index) => (
        <React.Fragment key={item.id ?? 'uncategorized'}>
          <button
            onClick={() => { handleFolderClick(item.id) }}
            className="text-gray-400 hover:text-green-400 hover:underline cursor-pointer bg-transparent border-none p-0"
            type="button"
          >
            {item.name}
          </button>
          {index < breadcrumbPath.length - 1 && <span>/</span>}
        </React.Fragment>
      ))}
    </div>
  )
}
