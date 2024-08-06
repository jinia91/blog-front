import React from 'react'
import { Provider } from 'jotai/index'
import { act, renderHook } from '@testing-library/react'
import { useFolderAndMemo } from '../memo-folder-usecases'
import { type Folder } from '../../(domain)/folder'
import { type Mock, vi } from 'vitest'

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
