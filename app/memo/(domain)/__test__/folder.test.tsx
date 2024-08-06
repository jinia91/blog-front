import { type Folder, folderFinder, folderManager } from '../folder'
import { type SimpleMemoInfo } from '../memo'
import { folderTestFixture } from './folder-test-fixture'

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
    const result = folderFinder.findFolderById([parent, folderTestFixture.buildEmpty(5)], 3)

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
    const result = folderFinder.findFolderById([parent, folderTestFixture.buildEmpty(5)], 10)

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
    const result = folderFinder.findMemoIdsInFolderRecursively(parent)

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
    const result = folderFinder.findMemoIdsInFolderRecursively(parent)

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
    const result = folderFinder.findFolderIdsPathToMemoId([level1, folderTestFixture.buildEmpty(40)], '1')

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
    const result = folderFinder.findFolderIdsPathToMemoId([folderTestFixture.buildEmpty(40), uncategorized], '1')

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
    const result = folderFinder.findUnCategorizedFolder([folderTestFixture.buildEmpty(40), uncategorized])

    // then
    expect(result).toEqual(uncategorized)
  })
})

describe('Folder 관리 테스트', () => {
  it('새로운 메모를 생성하면 uncategorized 폴더에 새 메모가 추가된다', () => {
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

    const newMemo: SimpleMemoInfo = {
      id: 4,
      title: '새 메모',
      references: []
    }

    // when
    const result = folderManager.rebuildFoldersAtCreatingNewMemo([folderTestFixture.buildEmpty(40), uncategorized], newMemo)

    // then
    expect(result[1].memos.length).toEqual(4)
  })

  it('새로운 메모가 추가될때 기존 폴더에 uncategorized 폴더가 존재하지 않는다면 새로 생성한다', () => {
    // given
    const newMemo: SimpleMemoInfo = {
      id: 4,
      title: '새 메모',
      references: []
    }
    // when
    const result = folderManager.rebuildFoldersAtCreatingNewMemo([folderTestFixture.buildEmpty(40)], newMemo)

    // then
    expect(result[1].memos.length).toEqual(1)
  })

  it('메모 아이디가 주어지고 해당 메모의 제목이 갱신요청이 있으면 폴더를 재구성하고 해당 메모의 제목이 갱신된다', () => {
    // given
    const uncategorized: Folder = {
      id: null,
      name: 'uncategorized',
      parent: null,
      children: [],
      memos: [
        { id: 1, title: '메모1', references: [] },
        { id: 2, title: '메모2', references: [] },
        { id: 3, title: '메��3', references: [] }
      ]
    }

    // when
    const result = folderManager.rebuildFoldersAtUpdatingMemoTitle([folderTestFixture.buildEmpty(40), uncategorized], '1', '갱신된 메모')

    // then
    expect(result[1].memos[0].title).toEqual('갱신된 메모')
  })

  it('메모 아이디가 주어지고 해당 메모의 제목이 갱신요청이 있지만 해당 메모가 없다면 폴더를 재구성하지 않는다', () => {
    // given
    const uncategorized: Folder = {
      id: null,
      name: 'uncategorized',
      parent: null,
      children: [],
      memos: [
        { id: 1, title: '메모1', references: [] },
        { id: 2, title: '메모2', references: [] },
        { id: 3, title: '메��3', references: [] }
      ]
    }

    // when
    const result = folderManager.rebuildFoldersAtUpdatingMemoTitle([folderTestFixture.buildEmpty(40), uncategorized], '10', '갱신된 메모')

    // then
    expect(result[1].memos[0].title).toEqual('메모1')
  })

  it('메모 아이디가 주어지고 해당 메모의 제목이 갱신요청이 있으면 메모가 존재하는 뎁스가 깊어도 정상 업데이트 된다', () => {
    // given
    const testFolder: Folder = {
      id: 10,
      name: 'uncategorized',
      parent: null,
      children: [],
      memos: [
        { id: 11, title: '메모1', references: [] },
        { id: 12, title: '메모2', references: [] },
        { id: 13, title: '메모3', references: [] }
      ]
    }

    const child1 = folderTestFixture.buildEmpty(2)
    const child2 = folderTestFixture.buildDefault(3)
    const parent = folderTestFixture.buildEmpty(1)
    parent.children = [child1, child2]
    child1.parent = parent
    child2.parent = parent
    child2.children = [testFolder]

    // when
    const result = folderManager.rebuildFoldersAtUpdatingMemoTitle([parent], '13', '갱신된 메모')

    // then
    expect(result[0].children[1].children[0].memos[2].title).toEqual('갱신된 메모')
  })

  it('메모 삭제 폴더 재갱신 요청이 있으면 폴더는 재갱신된다', () => {
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
    const result = folderManager.rebuildFoldersAtDeletingMemo([folderTestFixture.buildEmpty(40), uncategorized], '1')

    // then
    expect(result[1].memos.length).toEqual(2)
  })

  it('메모삭제 폴더 재갱신 요청시 메모가 깊은 뎁스의폴더에 있어도 정상 재갱신된다', () => {
    // given
    const testFolder: Folder = {
      id: 10,
      name: 'uncategorized',
      parent: null,
      children: [],
      memos: [
        { id: 11, title: '메모1', references: [] },
        { id: 12, title: '메모2', references: [] },
        { id: 13, title: '메모3', references: [] }
      ]
    }

    const child1 = folderTestFixture.buildEmpty(2)
    const child2 = folderTestFixture.buildDefault(3)
    const parent = folderTestFixture.buildEmpty(1)
    parent.children = [child1, child2]
    child1.parent = parent
    child2.parent = parent
    child2.children = [testFolder]

    // when
    const result = folderManager.rebuildFoldersAtDeletingMemo([parent], '13')

    // then
    expect(result[0].children[1].children[0].memos.length).toEqual(2)
  })

  it('폴더 이름 변경 폴더 재갱신 요청이 있으면 정상적으로 갱신된다', () => {
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

    const targertFolder = folderTestFixture.buildEmpty(40)

    // when
    const result = folderManager.rebuildFoldersAtUpdatingFolderTitle([targertFolder, uncategorized], '40', '새로운 이름')

    // then
    expect(result[0].name).toEqual('새로운 이름')
  })

  it('폴더 이름 변경 폴더 재갱신 요청이 있지만 해당 폴더가 없다면 폴더는 재갱신되지 않는다', () => {
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
    const result = folderManager.rebuildFoldersAtUpdatingFolderTitle([folderTestFixture.buildEmpty(40), uncategorized], '56', '새로운 이름')

    // then
    expect(result[1].name).toEqual('uncategorized')
  })

  it('폴더 이름 변경 폴더 재갱신 요청이 있고 폴더가 깊은 뎁스에 있어도 재갱신된다', () => {
    // given
    const testFolder: Folder = {
      id: 10,
      name: 'testFolder',
      parent: null,
      children: [],
      memos: [
        { id: 11, title: '메모1', references: [] },
        { id: 12, title: '메모2', references: [] },
        { id: 13, title: '메모3', references: [] }
      ]
    }

    const child1 = folderTestFixture.buildEmpty(2)
    const child2 = folderTestFixture.buildDefault(3)
    const parent = folderTestFixture.buildEmpty(1)
    parent.children = [child1, child2]
    child1.parent = parent
    child2.parent = parent
    child2.children = [testFolder]

    // when
    const result = folderManager.rebuildFoldersAtUpdatingFolderTitle([parent], '10', '새로운 이름')

    // then
    expect(result[0].children[1].children[0].name).toEqual('새로운 이름')
  })

  it('참조 폴더를 생성할 수 있다', () => {
    // given
    const references: SimpleMemoInfo[] = [
      { id: 1, title: '메모1', references: [] },
      { id: 2, title: '메모2', references: [] },
      { id: 3, title: '메모3', references: [] }
    ]
    const referenced: SimpleMemoInfo[] = [
      { id: 4, title: '메모4', references: [] },
      { id: 5, title: '메모5', references: [] },
      { id: 6, title: '메모6', references: [] }
    ]

    // when
    const result = folderManager.buildReferenceFolders(references, referenced)

    // then
    expect(result.length).toEqual(2)
  })

  it('새 폴더 생성시 폴더 갱신 요청이 있으면 폴더 가장 마지막 -1 위치에 새폴더가 생성된다', () => {
    // given
    const asIsFolders = [
      folderTestFixture.buildEmpty(40),
      folderTestFixture.buildEmpty(41),
      folderTestFixture.buildEmpty(42),
      folderTestFixture.buildUnCategorizedFolder()
    ]
    const newFolder = folderTestFixture.buildEmpty(100)

    // when
    const result = folderManager.rebuildFoldersAtCreatingNewFolder(asIsFolders, newFolder)

    // then
    expect(result.length).toEqual(5)
    expect(result[3].id).toEqual(100)
  })

  it('새 폴더 생성시 폴더 갱신 요청에서 기존 폴더에 uncategorized 폴더가 없다면 에러가 발생한다', () => {
    // given
    const asIsFolders = [
      folderTestFixture.buildEmpty(40),
      folderTestFixture.buildEmpty(41),
      folderTestFixture.buildEmpty(42)
    ]
    const newFolder = folderTestFixture.buildEmpty(100)

    // when, then
    expect(() => {
      folderManager.rebuildFoldersAtCreatingNewFolder(asIsFolders, newFolder)
    }).toThrowError('uncategorized 폴더가 존재하지 않습니다.')
  })

  it('새 폴더 생성시 폴더 갱신 요청에서 폴더가 기존에 존재한다면 에러가 발생한다', () => {
    // given
    const asIsFolders = [
      folderTestFixture.buildEmpty(40),
      folderTestFixture.buildEmpty(41),
      folderTestFixture.buildEmpty(42),
      folderTestFixture.buildUnCategorizedFolder()
    ]
    const newFolder = folderTestFixture.buildEmpty(42)

    // when, then
    expect(() => {
      folderManager.rebuildFoldersAtCreatingNewFolder(asIsFolders, newFolder)
    }).toThrowError('이미 존재하는 폴더입니다.')
  })
})
