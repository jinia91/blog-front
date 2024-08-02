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
    const result = folderManager.extractMemoIdsInFolderRecursively(parent)

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
    const result = folderManager.extractMemoIdsInFolderRecursively(parent)

    // then
    expect(result).toEqual([])
  })
})
