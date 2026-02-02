import React from 'react'
import { Provider } from 'jotai/index'
import { act, renderHook } from '@testing-library/react'
import { useFolderAndMemo } from '../memo-folder-usecases'
import { type Folder } from '../../(domain)/folder'
import { type Mock, vi } from 'vitest'
import { folderTestFixture } from '../../(domain)/__test__/folder-test-fixture'

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => <Provider>{children}</Provider>

describe('폴더 세팅 유즈케이스', () => {
  it('폴더를 세팅하면 정상적으로 변경된다', () => {
    // given
    const { result } = renderHook(() => useFolderAndMemo(), { wrapper })
    const folders: Folder[] = [
      {
        id: 1,
        name: '테스트 폴더1',
        memos: [],
        parent: null,
        children: []
      },
      {
        id: 2,
        name: '테스트 폴더2',
        memos: [],
        parent: null,
        children: []
      }
    ]

    // when
    act(() => {
      result.current.setFolders(folders)
    })

    // then
    expect(result.current.folders).toEqual(folders)
  })
})

describe('폴더와 메모 초기화 유즈케이스', () => {
  it('폴더와 메모를 초기화하면 정상적으로 변경된다', async () => {
    // given
    const { result } = renderHook(() => useFolderAndMemo(), { wrapper })
    const initialFolders: Folder[] = [
      {
        id: 1,
        name: '테스트 폴더1',
        memos: [],
        parent: null,
        children: []
      },
      {
        id: 2,
        name: '테스트 폴더2',
        memos: [],
        parent: null,
        children: []
      }
    ]

    global.fetch = vi.fn(() => {
      return ({
        ok: true,
        json: async () => ({ folderInfos: initialFolders })
      })
    }) as Mock

    // when
    await act(async () => {
      await result.current.initializeFolderAndMemo()
    })

    // then
    expect(result.current.folders).toEqual(initialFolders)
  })

  it('폴더 메모 초기화시 데이터를 못가져오면 예외를 반환한다', async () => {
    // given
    const { result } = renderHook(() => useFolderAndMemo(), { wrapper })

    global.fetch = vi.fn(() => ({
      ok: false,
      statusText: 'Internal Server Error'
    })) as Mock

    // when, then
    await act(async () => {
      await expect(result.current.initializeFolderAndMemo()).rejects.toThrowError('폴더 정보를 가져오는데 실패했습니다.')
    })
  })
})

describe('폴더 생성 유즈케이스', () => {
  it('폴더 생성요청을 성공하면 새폴더가 추가된다', async () => {
    // given
    const { result } = renderHook(() => useFolderAndMemo(), { wrapper })
    const initialFolders: Folder[] = [
      {
        id: 1,
        name: '테스트 폴더1',
        memos: [],
        parent: null,
        children: []
      },
      {
        id: 2,
        name: '테스트 폴더2',
        memos: [],
        parent: null,
        children: []
      },
      folderTestFixture.buildUnCategorizedFolder()
    ]
    global.fetch = vi.fn(() => ({
      ok: true,
      json: async () => ({ folder: { id: 3, name: '테스트 폴더3', memos: [], parent: null, children: [] } })
    })) as Mock

    // when
    act(() => {
      result.current.setFolders(initialFolders)
    })

    await act(async () => {
      await result.current.createNewFolder()
    })

    // then
    expect(result.current.folders[2]).toEqual(
      {
        id: 3,
        name: '테스트 폴더3',
        sequence: '',
        memos: [],
        parent: null,
        children: []
      }
    )
  })

  it('폴더 생성요청이 실패하면 에러가 발생한다', async () => {
    // given
    const { result } = renderHook(() => useFolderAndMemo(), { wrapper })
    global.fetch = vi.fn(() => ({
      ok: false,
      statusText: 'Internal Server Error'
    })) as Mock

    // when, then
    await expect(result.current.createNewFolder()).rejects.toThrowError('폴더 생성에 실패했습니다.')
  })
})

describe('메모 폴더 키워드 검색 유즈케이스', () => {
  it('키워드 검색에 성공하면 해당 키워드를 포함하는 메모와 폴더를 반환한다', async () => {
    // given
    const { result } = renderHook(() => useFolderAndMemo(), { wrapper })
    const initialFolders: Folder[] = [
      {
        id: 1,
        name: '테스트 폴더1',
        memos: [{ id: 1, title: '메모1', references: [] }],
        parent: null,
        children: []
      },
      {
        id: 2,
        name: '테스트 폴더2',
        memos: [{ id: 2, title: '메모2', references: [] }],
        parent: null,
        children: []
      }
    ]

    act(() => {
      result.current.setFolders(initialFolders)
    })

    global.fetch = vi.fn(() => ({
      ok: true,
      json: async () => ({
        result: {
          name: '검색결과',
          memos: [{ id: 1, title: '메모1', references: [] }]
        }
      })
    })) as Mock

    // when
    await act(async () => {
      await result.current.searchMemosByKeyword('메모1')
    })

    // then
    expect(result.current.folders[0].memos).toEqual(
      [{ id: 1, title: '메모1', references: [] }]
    )
  })

  it('키워드 검색에 실패하면 검색결과 빈배열을 반환한다', async () => {
    // given
    const { result } = renderHook(() => useFolderAndMemo(), { wrapper })
    const initialFolders: Folder[] = [
      {
        id: 1,
        name: '테스트 폴더1',
        memos: [{ id: 1, title: '메모1', references: [] }],
        parent: null,
        children: []
      },
      {
        id: 2,
        name: '테스트 폴더2',
        memos: [{ id: 2, title: '메모2', references: [] }],
        parent: null,
        children: []
      }
    ]

    act(() => {
      result.current.setFolders(initialFolders)
    })

    global.fetch = vi.fn(() => ({
      ok: false,
      statusText: 'Internal Server Error'
    })) as Mock

    // when
    await act(async () => {
      await result.current.searchMemosByKeyword('메모1')
    })

    // then
    expect(result.current.folders[0].memos).toEqual([])
  })

  it('키워드 검색 결과가 없으면 검색결과 빈배열을 반환한다', async () => {
    // given
    const { result } = renderHook(() => useFolderAndMemo(), { wrapper })
    const initialFolders: Folder[] = [
      {
        id: 1,
        name: '테스트 폴더1',
        memos: [{ id: 1, title: '메모1', references: [] }],
        parent: null,
        children: []
      },
      {
        id: 2,
        name: '테스트 폴더2',
        memos: [{ id: 2, title: '메모2', references: [] }],
        parent: null,
        children: []
      }
    ]

    act(() => {
      result.current.setFolders(initialFolders)
    })

    global.fetch = vi.fn(() => ({
      ok: true,
      json: async () => ({
        result: [{
          name: '검색결과',
          memos: []
        }]
      })
    })) as Mock

    // when
    await act(async () => {
      await result.current.searchMemosByKeyword('메모3')
    })
    // then
    expect(result.current.folders[0].memos).toEqual([])
  })
})

describe('폴더 삭제 유즈케이스', () => {
  it('폴더 삭제요청에 성공하면 해당 폴더가 삭제된다', async () => {
    // given
    const { result } = renderHook(() => useFolderAndMemo(), { wrapper })
    const initialFolders: Folder[] = [
      {
        id: 1,
        name: '테스트 폴더1',
        memos: [],
        parent: null,
        children: []
      },
      {
        id: 2,
        name: '테스트 폴더2',
        memos: [],
        parent: null,
        children: []
      }
    ]

    act(() => {
      result.current.setFolders(initialFolders)
    })

    let isDeleted = false

    global.fetch = vi.fn(() => ({
      ok: true,
      json: async () => {
        const result = isDeleted ? { folderInfos: [initialFolders[0]] } : []
        isDeleted = true
        return result
      }
    })) as Mock

    // when
    await act(async () => {
      await result.current.deleteFolder('2')
    })

    // then
    expect(result.current.folders).toEqual([initialFolders[0]])
  })

  it('폴더 삭제요청에 실패하면 에러가 발생한다', async () => {
    // given
    const { result } = renderHook(() => useFolderAndMemo(), { wrapper })
    global.fetch = vi.fn(() => ({
      ok: false,
      statusText: 'Internal Server Error'
    })) as Mock

    // when, then
    await expect(result.current.deleteFolder('2')).rejects.toThrowError('폴더 삭제에 실패했습니다.')
  })
})

describe('참조 메모 검색 유즈케이스', () => {
  it('참조 메모 검색에 성공하면 해당 메모를 참조하는 메모와 해당 메모들과 참조하는 메모들이 반환한다', async () => {
    // given
    const { result } = renderHook(() => useFolderAndMemo(), { wrapper })
    let isreferences = true
    global.fetch = vi.fn(() => ({
      ok: true,
      json: async () => {
        if (isreferences) {
          isreferences = false
          return {
            references: [{ id: 1, title: '메모1', references: [2] }]
          }
        } else {
          return {
            referenceds: [{ id: 2, title: '메모2', references: [] }]
          }
        }
      }
    })) as Mock

    // when
    await act(async () => {
      await result.current.searchReferenceMemos('2')
    })

    // then
    expect(result.current.folders[0].memos).toEqual(
      [{ id: 1, title: '메모1', references: [2] }]
    )
    expect(result.current.folders[1].memos).toEqual(
      [{ id: 2, title: '메모2', references: [] }]
    )
  })

  it('참조 메모 검색에 실패하면 검색결과 빈배열을 반환한다', async () => {
    // given
    const { result } = renderHook(() => useFolderAndMemo(), { wrapper })
    global.fetch = vi.fn(() => ({
      ok: false,
      statusText: 'Internal Server Error'
    })) as Mock

    // when
    await act(async () => {
      await result.current.searchReferenceMemos('2')
    })

    // then
    expect(result.current.folders[0].memos).toEqual([])
    expect(result.current.folders[1].memos).toEqual([])
  })
})

describe('메모 생성 유즈케이스', () => {
  it('메모 생성에 실패하면 에러를 반환한다', async () => {
    // given
    const { result } = renderHook(() => useFolderAndMemo(), { wrapper })
    global.fetch = vi.fn(() => ({
      ok: false,
      statusText: 'Internal Server Error'
    })) as Mock

    // when, then
    await expect(result.current.createNewMemo()).rejects.toThrowError('메모 생성에 실패했습니다.')
  })

  it('메모 생성에 성공하면 새 메모가 추가된다', async () => {
    // given
    const { result } = renderHook(() => useFolderAndMemo(), { wrapper })
    const initialFolders: Folder[] = [
      {
        id: 1,
        name: '테스트 폴더1',
        memos: [],
        parent: null,
        children: []
      },
      {
        id: 2,
        name: '테스트 폴더2',
        memos: [],
        parent: null,
        children: []
      },
      folderTestFixture.buildUnCategorizedFolder()
    ]

    act(() => {
      result.current.setFolders(initialFolders)
    })

    global.fetch = vi.fn(() => ({
      ok: true,
      json: async () => ({ memoId: 3 })
    })) as Mock

    // when
    await act(async () => {
      await result.current.createNewMemo()
    })

    // then
    expect(result.current.folders[2].memos).toEqual(
      [{ id: 3, title: '', sequence: '', references: [] }]
    )
  })
})

describe('메모 제목변경 유즈케이스', () => {
  it('메모 제목변경에 성공하면 해당 메모의 제목이 변경된다', () => {
    // given
    const { result } = renderHook(() => useFolderAndMemo(), { wrapper })
    const initialFolders: Folder[] = [
      {
        id: 1,
        name: '테스트 폴더1',
        memos: [{ id: 1, title: '메모1', references: [] }],
        parent: null,
        children: []
      },
      {
        id: 2,
        name: '테스트 폴더2',
        memos: [{ id: 2, title: '메모2', references: [] }],
        parent: null,
        children: []
      }
    ]

    act(() => {
      result.current.setFolders(initialFolders)
    })

    // when
    act(() => {
      result.current.writeNewMemoTitle('1', '메모1-1')
    })

    // then
    expect(result.current.folders[0].memos).toEqual(
      [{ id: 1, title: '메모1-1', references: [] }]
    )
  })
})

describe('메모 삭제 유즈케이스', () => {
  it('메모 삭제 요청이 실패하면 에러가 발생한다', async () => {
    // given
    const { result } = renderHook(() => useFolderAndMemo(), { wrapper })
    global.fetch = vi.fn(() => ({
      ok: false,
      statusText: 'Internal Server Error'
    })) as Mock

    // when, then
    await expect(result.current.deleteMemo('1')).rejects.toThrowError('메모 삭제에 실패했습니다.')
  })

  it('메모 삭제 요청이 성공하면 해당 메모가 삭제된다', async () => {
    // given
    const { result } = renderHook(() => useFolderAndMemo(), { wrapper })
    const initialFolders: Folder[] = [
      {
        id: 1,
        name: '테스트 폴더1',
        memos: [{ id: 1, title: '메모1', references: [] }, { id: 2, title: '메모2', references: [] }],
        parent: null,
        children: []
      },
      {
        id: 2,
        name: '테스트 폴더2',
        memos: [{ id: 3, title: '메모3', references: [] }],
        parent: null,
        children: []
      }
    ]

    act(() => {
      result.current.setFolders(initialFolders)
    })

    global.fetch = vi.fn(() => ({
      ok: true,
      json: async () => ({})
    })) as Mock

    // when
    await act(async () => {
      await result.current.deleteMemo('1')
    })

    // then
    expect(result.current.folders[0].memos).toEqual([{ id: 2, title: '메모2', references: [] }])
  })
})

describe('메모 or 폴더 -> 폴더 관계 설정 유즈케이스', () => {
  it('메모를 폴더에 넣기에 성공하면 해당 메모는 폴더에 들어간다', async () => {
    // given
    const { result } = renderHook(() => useFolderAndMemo(), { wrapper })
    const initialFolders: Folder[] = [
      {
        id: 1,
        name: '테스트 폴더1',
        memos: [{ id: 1, title: '메모1', references: [] }],
        parent: null,
        children: []
      },
      {
        id: 2,
        name: '테스트 폴더2',
        memos: [],
        parent: null,
        children: []
      },
      folderTestFixture.buildUnCategorizedFolder()
    ]

    act(() => {
      result.current.setFolders(initialFolders)
    })

    let needToMove = true
    global.fetch = vi.fn(() => ({
      ok: true,
      json: async () => {
        if (needToMove) {
          needToMove = false
          return {}
        } else {
          return {
            folderInfos: [{ id: 1, name: '테스트 폴더1', memos: [], parent: null, children: [] },
              { id: 2, name: '테스트 폴더2', memos: [{ id: 1, title: '메모1', references: [] }], parent: null, children: [] }
            ]
          }
        }
      }
    })) as Mock

    // when
    await act(async () => {
      await result.current.makeRelationshipAndRefresh({ id: 1, type: 'memo' }, 2)
    })

    // then
    expect(result.current.folders[1].memos).toEqual([{ id: 1, title: '메모1', references: [] }])
  })

  it('메모를 폴더에 넣기에 실패하면 에러가 발생한다', async () => {
    // given
    const { result } = renderHook(() => useFolderAndMemo(), { wrapper })
    global.fetch = vi.fn(() => ({
      ok: false,
      statusText: 'Internal Server Error'
    })) as Mock

    // when, then
    await expect(result.current.makeRelationshipAndRefresh({
      id: 1,
      type: 'memo'
    }, 2)).rejects.toThrowError('메모 -> 폴더 이동에 실패했습니다.')
  })

  it('폴더를 폴더에 넣기에 성공하면 해당 폴더는 폴더에 들어간다', async () => {
    // given
    const { result } = renderHook(() => useFolderAndMemo(), { wrapper })
    const initialFolders: Folder[] = [
      {
        id: 1,
        name: '테스트 폴더1',
        memos: [],
        parent: null,
        children: []
      },
      {
        id: 2,
        name: '테스트 폴더2',
        memos: [],
        parent: null,
        children: []
      },
      folderTestFixture.buildUnCategorizedFolder()
    ]

    act(() => {
      result.current.setFolders(initialFolders)
    })

    let needToMove = true
    global.fetch = vi.fn(() => ({
      ok: true,
      json: async () => {
        if (needToMove) {
          needToMove = false
          return {}
        } else {
          return {
            folderInfos: [{
              id: 1,
              name: '테스트 폴더1',
              memos: [],
              parent: null,
              children: [{ id: 2, name: '테스트 폴더2', memos: [], parent: null, children: [] }]
            },
            { id: 2, name: '테스트 폴더2', memos: [], parent: null, children: [] }
            ]
          }
        }
      }
    })) as Mock

    // when
    await act(async () => {
      await result.current.makeRelationshipAndRefresh({ id: 2, type: 'folder' }, 1)
    })

    // then
    expect(result.current.folders[0].children).toEqual([{
      id: 2,
      name: '테스트 폴더2',
      memos: [],
      parent: null,
      children: []
    }])
  })

  it('폴더를 폴더에 넣기에 실패하면 에러가 발생한다', async () => {
    // given
    const { result } = renderHook(() => useFolderAndMemo(), { wrapper })
    global.fetch = vi.fn(() => ({
      ok: false,
      statusText: 'Internal Server Error'
    })) as Mock

    // when, then
    await expect(result.current.makeRelationshipAndRefresh({
      id: 2,
      type: 'folder'
    }, 1)).rejects.toThrowError('폴더 -> 폴더 이동에 실패했습니다.')
  })

  it('비정상 타입으로 이동을 시도하면 에러가 발생한다', async () => {
    // given
    const { result } = renderHook(() => useFolderAndMemo(), { wrapper })

    // when, then
    await expect(result.current.makeRelationshipAndRefresh({
      id: 2,
      type: 'test'

    }, 1)).rejects.toThrowError('잘못된 타입입니다.')
  })
})
