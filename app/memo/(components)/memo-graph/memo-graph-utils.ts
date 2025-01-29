import type { Folder } from '../../(domain)/folder'
import type { LinkObject, NodeObject } from 'force-graph'

export const FOLDER_GROUP = 6
export const MEMO_GROUP = 109
export const FOLDER_MEMO_GROUP_SEPARATOR = 100

export const memoGraphUtils: {
  buildFolderNodes: (folders: Folder[]) => NodeObject[]
  buildMemoNodes: (folders: Folder[]) => NodeObject[]
  buildMemoLinks: (folders: Folder[]) => LinkObject[]
  buildFolderLinks: (folders: Folder[]) => LinkObject[]
  buildFolderMemoLinks: (folders: Folder[]) => LinkObject[]
} = {
  buildFolderNodes (flattenedFolders: Folder[]): NodeObject[] {
    const folderNodes: NodeObject[] = []

    function createFolderNodes (folder: Folder, group: number, nodes: any): void {
      nodes.push({
        id: folder.id ?? -1,
        name: folder.name,
        group
      })
    }

    flattenedFolders.filter(
      folder => folder.id !== null
    ).forEach((folder, index) => {
      createFolderNodes(folder, FOLDER_GROUP, folderNodes)
    })
    return folderNodes
  },
  buildMemoNodes (flattenedFolders: Folder[]): NodeObject[] {
    const memoNodes: NodeObject[] = []

    function createMemoNodes (folder: Folder, nodes: any): void {
      folder.memos.forEach((memo, index) => {
        nodes.push({
          id: memo.id,
          name: memo.title,
          group: MEMO_GROUP
        })
      })
    }

    flattenedFolders.forEach(folder => {
      createMemoNodes(folder, memoNodes)
    })
    return memoNodes
  },
  buildMemoLinks (flattenedFolders: Folder[]): LinkObject[] {
    const memoLinks: LinkObject[] = []

    function createMemoLinks (folder: Folder, links: any): void {
      folder.memos.forEach(memo => {
        memo.references?.forEach(ref => {
          links.push({
            source: memo.id,
            target: ref.id
          })
        })
      })
    }

    flattenedFolders.forEach(folder => {
      createMemoLinks(folder, memoLinks)
    })
    return memoLinks
  },
  buildFolderLinks (flattenedFolders: Folder[]): LinkObject[] {
    const folderLinks: LinkObject[] = []

    function createFolderLinks (folder: Folder, links: any): void {
      folder.children.forEach(child => {
        links.push({
          source: child.id,
          target: folder.id
        })
      })
    }

    flattenedFolders.filter(
      folder => folder.id !== null
    ).forEach(folder => {
      createFolderLinks(folder, folderLinks)
    })
    return folderLinks
  },
  buildFolderMemoLinks (flattenedFolders: Folder[]): LinkObject[] {
    const folderMemoLinks: LinkObject[] = []

    function createFolderMemoLinks (folder: Folder, links: any): void {
      folder.memos.forEach(memo => {
        links.push({
          source: memo.id,
          target: folder.id
        })
      })
    }

    flattenedFolders.filter(
      folder => folder.id !== null
    ).forEach(folder => {
      createFolderMemoLinks(folder, folderMemoLinks)
    })
    return folderMemoLinks
  }
}
