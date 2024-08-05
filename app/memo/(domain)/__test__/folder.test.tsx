import { type Folder, folderManager } from '../folder'

const folderTestFixture = {
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
      parent: null,
      children: [],
      memos: []
    }
  },

  buildDefault (id: number): Folder {
    return {
      id,
      name: '폴더2',
      parent: null,
      children: [],
      memos: [
        { id: 1, title: '메모1', references: [] },
        { id: 2, title: '메모2', references: [] },
        { id: 3, title: '메모3', references: [] }
      ]
    }
  }
}

describe('Folder 탐색 테스트', () => {
  it('계층화된 폴더구조에서 특정 폴더를 아이디로 찾을 수 있다', () => {
    // given
    const child1 = folderTestFixture.buildEmpty(2)
    const child2 = folderTestFixture.buildDefault(3)
    const child3 = folderTestFixture.buildEmpty(4)
    const parent = folderTestFixture.buildEmpty(1)
    parent.children = [child1, child2, child3]
    child1.parent = parent
    child2.parent = parent
    child3.parent = parent

    // when
    const result = folderManager.findFolderById([parent, folderTestFixture.buildEmpty(5)], 3)

    // then
    expect(result).toEqual(child2)
  })

  it('계층화된 폴더구조에서 특정 폴더를 아이디로 찾을 수 없다면 null을 반환한다', () => {
    // given
    const child1 = folderTestFixture.buildEmpty(2)
    const child2 = folderTestFixture.buildDefault(3)
    const child3 = folderTestFixture.buildEmpty(4)
    const parent = folderTestFixture.buildEmpty(1)
    parent.children = [child1, child2, child3]
    child1.parent = parent
    child2.parent = parent
    child3.parent = parent

    // when
    const result = folderManager.findFolderById([parent, folderTestFixture.buildEmpty(5)], 10)

    // then
    expect(result).toBeNull()
  })

  it('계층화된 폴더구조에서 특정 폴더의 모든 메모 아이디를 찾을 수 있다', () => {
    // given
    const child = folderTestFixture.buildHierarchy()
    const parent = folderTestFixture.buildEmpty(10)
    parent.children = [child]
    child.parent = parent

    // when
    const result = folderManager.findMemoIdsInFolderRecursively(parent)

    // then
    expect(result).toEqual(['1', '2', '3'])
  })

  it('계층화된 폴더구조에서 특정 폴더의 모든 메모 아이디를 찾을 수 없다면 빈 배열을 반환한다', () => {
    // given
    const child = folderTestFixture.buildEmpty(2)
    const parent = folderTestFixture.buildEmpty(1)
    parent.children = [child]
    child.parent = parent

    // when
    const result = folderManager.findMemoIdsInFolderRecursively(parent)

    // then
    expect(result).toEqual([])
  })

  it('계층화된 폴더구조에서 특정 메모 아이디를 가진 폴더의 모든  상위 경로들을 찾을 수 있다', () => {
    // given
    const level1 = folderTestFixture.buildEmpty(10)
    const level2L1 = folderTestFixture.buildEmpty(20)
    const level2L2 = folderTestFixture.buildEmpty(21)
    const level3L1 = folderTestFixture.buildDefault(30)
    const level3L2 = folderTestFixture.buildEmpty(31)
    const level3L3 = folderTestFixture.buildEmpty(32)
    level1.children = [level2L1, level2L2]
    level2L1.parent = level1
    level2L2.parent = level1
    level2L1.children = [level3L1, level3L2]
    level3L1.parent = level2L1
    level3L2.parent = level2L1
    level2L2.children = [level3L3]
    level3L3.parent = level2L2

    // when
    const result = folderManager.findFolderIdsPathToMemoId([level1, folderTestFixture.buildEmpty(40)], '1')

    // then
    expect(result).toEqual(['30', '20', '10'])
  })

  it('찾으려는 메모가  uncategorized에 있을때 해당 메모 아이디로 탐색하면 id 0 인 폴더를 반환한다', () => {
    // given
    const uncategorized: Folder = {
      id: null,
      name: 'uncategorized',
      parent: null,
      children: [],
      memos: [
        { id: 1, title: '메모1', references: [] },
        { id: 2, title: '메모2', references: [] },
        { id: 3, title: '메모3', references: [] }
      ]
    }

    // when
    const result = folderManager.findFolderIdsPathToMemoId([folderTestFixture.buildEmpty(40), uncategorized], '1')

    // then
    expect(result).toEqual(['0'])
  })

  it('uncategorized 폴더를 찾을 수 있다', () => {
    // given
    const uncategorized: Folder = {
      id: null,
      name: 'uncategorized',
      parent: null,
      children: [],
      memos: []
    }

    // when
    const result = folderManager.findUnCategorizedFolder([folderTestFixture.buildEmpty(40), uncategorized])

    // then
    expect(result).toEqual(uncategorized)
  })
})
