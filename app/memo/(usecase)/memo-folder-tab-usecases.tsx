import { useFolderAndMemo } from './memo-folder-usecases'
import { useTabBarAndRouter } from '../../(layout)/(usecase)/tab-usecases'
import { folderManager } from '../(domain)/folder'
import { type Tab } from '../../(layout)/(domain)/tab'

export const useMemoFolderWithTabRouter = (): {
  deleteFolderAndUpdateTabs: (folderId: string) => Promise<void>
  deleteMemoAndUpdateTabs: (memoId: string) => Promise<void>
} => {
  const { folders, deleteFolder, deleteMemo } = useFolderAndMemo()
  const { tabs, closeTabs, closeTab } = useTabBarAndRouter()

  const deleteFolderAndUpdateTabs = async (folderId: string): Promise<void> => {
    const toBeDeleteFolder = folderManager.findFolderById(folders, parseInt(folderId))
    if (toBeDeleteFolder == null) return

    await deleteFolder(folderId)

    const deletedMemoIds = folderManager.extractMemoIdsInFolderRecursively(toBeDeleteFolder)
    if (deletedMemoIds.length === 0) return

    const toBeClosedTabIdx = tabs.filter((tab: Tab) => {
      const memoId = tab.urlPath.startsWith('/memo/') ? tab.urlPath.split('/')[2] : null
      return memoId !== null && deletedMemoIds.includes(memoId)
    }).map((tab: Tab) => tabs.indexOf(tab))
    if (toBeClosedTabIdx.length === 0) return

    closeTabs(toBeClosedTabIdx)
  }

  const deleteMemoAndUpdateTabs = async (memoId: string): Promise<void> => {
    await deleteMemo(memoId)

    const deletedTabIndex = tabs.findIndex((tab: Tab) => {
      return tab.urlPath.startsWith('/memo/') && tab.urlPath.split('/')[2] === memoId
    })
    if (deletedTabIndex === -1) return
    closeTab(deletedTabIndex)
  }

  return {
    deleteFolderAndUpdateTabs,
    deleteMemoAndUpdateTabs
  }
}
