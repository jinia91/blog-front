import { describe, it } from 'vitest'
import { type Folder, folderManager } from '../folder'

const folderTestFixture = {
  buildHirachy (): Folder {
    const parent = folderTestFixture.buildEmpty()
    const child = folderTestFixture.buildDefault()
    child.parent = parent
    parent.children = [child]
    return parent
  },

  buildEmpty (): Folder {
    return {
      id: 1,
      name: '폴더1',
      parent: null,
      children: [],
      memos: []
    }
  },

  buildDefault (): Folder {
    return {
      id: 1,
      name: '폴더1',
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

describe('폴더 탐색 테스트', () => {
  it('폴더 안에 찾고자 하는 메모가 있는지 확인 가능하다', () => {
    // given
    const folder = folderTestFixture.buildDefault()

    // when
    const result = folderManager.containsMemo(folder, '1')

    // then
    expect(result).toBe(true)
  })

  it('폴더를 재귀적으로 탐색하여 메모가 있는지 확인 가능하다', () => {
    // given
    const parent = folderTestFixture.buildHirachy()

    // when
    const result = folderManager.containsMemo(parent, '3')

    // then
    expect(result).toBe(true)
  })

  it('재귀적 폴더 모두에 메모가 없다면 false를 반환한다', () => {
    // given
    const parent = folderTestFixture.buildHirachy()

    // when
    const result = folderManager.containsMemo(parent, '4')

    // then
    expect(result).toBe(false)
  })
})
