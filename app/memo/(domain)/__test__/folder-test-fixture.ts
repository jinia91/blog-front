import type { Folder } from '../folder'

export const folderTestFixture = {
  buildHierarchy (): Folder {
    const parent = folderTestFixture.buildEmpty(1)
    const child = folderTestFixture.buildDefault(2)
    child.parent = parent
    parent.children = [child]
    return parent
  },

  buildEmpty (id: number): Folder {
    return {
      id,
      name: '폴더1',
      sequence: 'm',
      parent: null,
      children: [],
      memos: []
    }
  },

  buildDefault (id: number): Folder {
    return {
      id,
      name: '폴더2',
      sequence: 'm',
      parent: null,
      children: [],
      memos: [
        { id: 1, title: '메모1', sequence: 'g', references: [] },
        { id: 2, title: '메모2', sequence: 'm', references: [] },
        { id: 3, title: '메모3', sequence: 't', references: [] }
      ]
    }
  },

  buildUnCategorizedFolder (): Folder {
    return {
      id: null,
      name: 'uncategorized',
      sequence: '',
      parent: null,
      children: [],
      memos: []
    }
  }
}
