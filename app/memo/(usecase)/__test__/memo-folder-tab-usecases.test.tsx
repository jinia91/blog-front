import { act, renderHook } from '@testing-library/react'
import { useMemoFolderWithTabRouter } from '../memo-folder-tab-usecases'
import { Provider } from 'jotai'
import { type Mock, vi } from 'vitest'
import React from 'react'
import { useFolderAndMemo } from '../memo-folder-usecases'
import { usePathname, useRouter } from 'next/navigation'
import { useTabBarAndRouter } from '../../../(layout)/(usecase)/tab-usecases'

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => <Provider>{children}</Provider>

describe('폴더 삭제 후 탭 업데이트 및 라우팅 유즈케이스 테스트', () => {
  it('존재하지 않는 폴더 삭제 요청시 에러가 발생한다', async () => {
    // given
    const { result } = renderHook(() => useMemoFolderWithTabRouter(), { wrapper })

    // when, then
    await expect(result.current.deleteFolderAndUpdateTabs).rejects.toThrow('폴더를 찾을 수 없습니다')
  })

  it('폴더 삭제시 삭제된 폴더가 탭과 라우터에 영향을 주지 못한다면 탭과 url에 변화가 없다', async () => {
    // given
    const { result } = renderHook(() => {
      return {
        sut: useMemoFolderWithTabRouter(),
        supportFolder: useFolderAndMemo(),
        supportRouter: useRouter(),
        nowPath: usePathname()
      }
    }, { wrapper })
    // init
    act(() => {
      result.current.supportRouter.push('/')
      result.current.supportFolder.setFolders([{ id: 1, name: 'test', memos: [], children: [], parent: null }])
    })

    global.fetch = vi.fn((input: string) => {
      switch (input) {
        case 'http://localhost:7777/api/v1/folders/1':
          return {
            ok: true,
            json: async () => ({ folderId: 1 })
          }
        case 'http://localhost:7777/api/v1/folders':
          return {
            ok: true,
            json: async () => ({ folderInfos: [] })
          }
      }
    }) as Mock

    // when
    await act(async () => {
      await result.current.sut.deleteFolderAndUpdateTabs('1')
    })

    // then
    expect(result.current.supportFolder.folders).toEqual([])
    expect(result.current.nowPath).toBe('/')
  })

  it('폴더 삭제시 삭제된 폴더가 탭에 영향을 주면 탭이 수정된다', async () => {
    // given
    const { result } = renderHook(() => {
      return {
        sut: useMemoFolderWithTabRouter(),
        supportFolder: useFolderAndMemo(),
        supportTab: useTabBarAndRouter(),
        supportRouter: useRouter(),
        nowPath: usePathname()
      }
    }, { wrapper })
    // init
    act(() => {
      result.current.supportTab.upsertAndSelectTab({ name: '폴더안의 메모 테스트', urlPath: '/memo/1' })
    })

    act(() => {
      result.current.supportTab.upsertAndSelectTab({ name: '폴더밖의 메모 테스트', urlPath: '/memo/4' })
      result.current.supportFolder.setFolders(
        [{
          id: 1,
          name: 'test',
          memos: [
            { id: 1, title: '메모1', references: [] },
            { id: 2, title: '메모2', references: [] },
            { id: 3, title: '메모3', references: [] }
          ],
          children: [],
          parent: null
        }])
    })

    global.fetch = vi.fn((input: string) => {
      switch (input) {
        case 'http://localhost:7777/api/v1/folders/1':
          return {
            ok: true,
            json: async () => ({ folderId: 1 })
          }
        case 'http://localhost:7777/api/v1/folders':
          return {
            ok: true,
            json: async () => ({ folderInfos: [] })
          }
      }
    }) as Mock

    // when
    await act(async () => {
      await result.current.sut.deleteFolderAndUpdateTabs('1')
    })

    // then
    expect(result.current.supportFolder.folders).toEqual([])
    expect(result.current.nowPath).toBe('/memo/4')
  })

  it('폴더 삭제시 삭제된 폴더가 탭에 영향을 주면 탭이 수정되고 현재 페이지라면 최신 페이지로 이동한다', async () => {
    // given
    const { result } = renderHook(() => {
      return {
        sut: useMemoFolderWithTabRouter(),
        supportFolder: useFolderAndMemo(),
        supportTab: useTabBarAndRouter(),
        supportRouter: useRouter(),
        nowPath: usePathname()
      }
    }, { wrapper })
    // init
    act(() => {
      result.current.supportTab.upsertAndSelectTab({ name: '일반탭', urlPath: '/about' })
      result.current.supportTab.upsertAndSelectTab({ name: '폴더밖의 메모 테스트', urlPath: '/memo/4' })
    })

    act(() => {
      result.current.supportTab.upsertAndSelectTab({ name: '폴더안의 메모 테스트', urlPath: '/memo/1' })
      result.current.supportFolder.setFolders(
        [{
          id: 1,
          name: 'test',
          memos: [
            { id: 1, title: '메모1', references: [] },
            { id: 2, title: '메모2', references: [] },
            { id: 3, title: '메모3', references: [] }
          ],
          children: [],
          parent: null
        }])
    })

    global.fetch = vi.fn((input: string) => {
      switch (input) {
        case 'http://localhost:7777/api/v1/folders/1':
          return {
            ok: true,
            json: async () => ({ folderId: 1 })
          }
        case 'http://localhost:7777/api/v1/folders':
          return {
            ok: true,
            json: async () => ({ folderInfos: [] })
          }
      }
    }) as Mock

    // when
    await act(async () => {
      await result.current.sut.deleteFolderAndUpdateTabs('1')
    })

    // then
    expect(result.current.supportFolder.folders).toEqual([])
    expect(result.current.nowPath).toBe('/memo/4')
  })
})

describe('메모 삭제 후 탭 업데이트 및 라우팅 유즈케이스 테스트', () => {
  it('메모 삭제 후 탭 업데이트가 필요하지 않으면 탭과 url은 변경되지 않는다', async () => {
    // given
    const { result } = renderHook(() => {
      return {
        sut: useMemoFolderWithTabRouter(),
        supportFolder: useFolderAndMemo(),
        supportTab: useTabBarAndRouter(),
        supportRouter: useRouter(),
        nowPath: usePathname()
      }
    }, { wrapper })
    // init
    act(() => {
      result.current.supportTab.upsertAndSelectTab({ name: '폴더밖의 메모 테스트', urlPath: '/memo/4' })
      result.current.supportFolder.setFolders(
        [{
          id: 1,
          name: 'test',
          memos: [
            { id: 1, title: '메모1', references: [] },
            { id: 2, title: '메모2', references: [] },
            { id: 3, title: '메모3', references: [] }
          ],
          children: [],
          parent: null
        }])
    })

    global.fetch = vi.fn((input: string) => {
      switch (input) {
        case 'http://localhost:7777/api/v1/memos/1':
          return {
            ok: true,
            json: async () => ({ memoId: 1 })
          }
      }
    }) as Mock

    // when
    await act(async () => {
      await result.current.sut.deleteMemoAndUpdateTabs('1')
    })

    // then
    expect(result.current.supportFolder.folders).toEqual([{
      id: 1,
      name: 'test',
      memos: [
        { id: 2, title: '메모2', references: [] },
        { id: 3, title: '메모3', references: [] }
      ],
      children: [],
      parent: null
    }])
    expect(result.current.nowPath).toBe('/memo/4')
  })

  it('메모 삭제 후 현재 페이지라면 탭과 url이 수정된다', async () => {
    // given
    const { result } = renderHook(() => {
      return {
        sut: useMemoFolderWithTabRouter(),
        supportFolder: useFolderAndMemo(),
        supportTab: useTabBarAndRouter(),
        supportRouter: useRouter(),
        nowPath: usePathname()
      }
    }, { wrapper })
    // init
    act(() => {
      result.current.supportTab.upsertAndSelectTab({ name: '메모3', urlPath: '/memo/3' })
    })

    act(() => {
      result.current.supportTab.upsertAndSelectTab({ name: '현재 메모1', urlPath: '/memo/1' })
      result.current.supportFolder.setFolders(
        [{
          id: 1,
          name: 'test',
          memos: [
            { id: 1, title: '메모1', references: [] },
            { id: 2, title: '메모2', references: [] },
            { id: 3, title: '메모3', references: [] }
          ],
          children: [],
          parent: null
        }])
    })

    global.fetch = vi.fn((input: string) => {
      switch (input) {
        case 'http://localhost:7777/api/v1/memos/1':
          return {
            ok: true,
            json: async () => ({ memoId: 1 })
          }
      }
    }) as Mock

    // when
    await act(async () => {
      await result.current.sut.deleteMemoAndUpdateTabs('1')
    })

    // then
    expect(result.current.supportFolder.folders).toEqual([{
      id: 1,
      name: 'test',
      memos: [
        { id: 2, title: '메모2', references: [] },
        { id: 3, title: '메모3', references: [] }
      ],
      children: [],
      parent: null
    }])
    expect(result.current.nowPath).toBe('/memo/3')
  })
})
