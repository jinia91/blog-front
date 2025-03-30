import { unstable_noStore as noStore } from 'next/cache'
import { HOST } from '../../(utils)/constants'
import { type Memo, type SimpleMemoInfo } from '../(domain)/memo'
import { type Folder } from '../(domain)/folder'
import { withAuthRetry } from '../../login/(infra)/auth-api'

export async function createMemo (): Promise<{ memoId: number } | null> {
  const apiCall = async (): Promise<Response> => {
    return await fetch(HOST + '/v1/memos', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })
  }
  const response = await withAuthRetry(apiCall)
  if (!response.ok) {
    console.error('메모생성에 실패했습니다', response.statusText)
    return null
  }
  return await response.json()
}

export async function fetchRelatedMemo (keyword: string, thisId: string): Promise<Memo[] | null> {
  const apiCall = async (): Promise<Response> => {
    return await fetch(HOST + `/v1/memos/${thisId}/recommended?keyword=${keyword}`,
      {
        cache: 'no-store',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
  }
  const response = await withAuthRetry(apiCall)
  if (!response.ok) {
    console.error('관련 메모 가져오기 실패')
    return null
  }
  const data = await response.json()
  return data.memos
}

export async function fetchMemoById (id: string): Promise<Memo | null> {
  noStore()
  const apiCall = async (): Promise<Response> => {
    return await fetch(HOST + `/v1/memos/${id}`,
      {
        cache: 'no-store',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
  }

  const response = await withAuthRetry(apiCall)
  if (!response.ok) {
    console.error('메모 조회 실패')
    return null
  }
  return await response.json()
}

export async function deleteMemoById (id: string): Promise<boolean> {
  const apiCall = async (): Promise<Response> => {
    return await fetch(HOST + `/v1/memos/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  const response = await withAuthRetry(apiCall)
  return response.ok
}

export async function fetchFolderAndMemo (): Promise<Folder[] | null> {
  noStore()
  const apiCall = async (): Promise<Response> => {
    return await fetch(HOST + '/v1/folders',
      {
        cache: 'no-store',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
  }

  const response = await withAuthRetry(apiCall)
  if (!response.ok) {
    console.error('folder memo 가져오기 실패')
    return null
  }
  const data: { folderInfos: Folder[] } = await response.json()
  return data.folderInfos
}

export async function requestCreateFolder (): Promise<Folder | null> {
  noStore()
  const apiCall = async (): Promise<Response> => {
    return await fetch(HOST + '/v1/folders', {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
  const response = await withAuthRetry(apiCall)
  if (!response.ok) {
    console.error('폴더 생성에 실패했습니다')
    return null
  }
  return await response.json()
    .then((data) => {
      const result: Folder | null = {
        id: data.folder.id,
        name: data.folder.name,
        memos: [],
        children: [],
        parent: null
      }
      return result
    }
    )
}

export async function changeFolderName (folderId: string, toBeName: string): Promise<any> {
  const apiCall = async (): Promise<Response> => {
    return await fetch(HOST + `/v1/folders/${folderId}/name`, {
      credentials: 'include',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ folderId, name: toBeName })
    })
  }

  const response = await withAuthRetry(apiCall)
  if (!response.ok) {
    console.error('폴더 이름 변경에 실패했습니다')
    return null
  }
  return await response.json()
}

export async function deleteFolderById (folderId: string): Promise<any> {
  const apiCall = async (): Promise<Response> => {
    return await fetch(HOST + `/v1/folders/${folderId}`, {
      credentials: 'include',
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  const response = await withAuthRetry(apiCall)
  if (!response.ok) {
    console.error('폴더 삭제 api 호출시 에러, 정상 삭제가 되지 않았습니다')
    return null
  }
  return await response.json()
}

export async function makeRelationshipWithFolders (childFolderId: string, parentFolderId: string | null): Promise<any> {
  const apiCall = async (): Promise<Response> => {
    return await fetch(HOST + `/v1/folders/${childFolderId}/parent`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ parentId: parentFolderId })
    })
  }

  const response = await withAuthRetry(apiCall)
  if (!response.ok) {
    console.error('폴더 관계 설정에 실패했습니다')
    return null
  }
  return await response.json()
}

export async function makeRelationshipWithMemoAndFolders (memoId: string, folderId: string | null): Promise<any> {
  const apiCall = async (): Promise<Response> => {
    return await fetch(HOST + `/v1/memos/${memoId}/parent`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ folderId })
    })
  }

  const response = await withAuthRetry(apiCall)
  if (!response.ok) {
    console.error('메모 폴더 관계 설정에 실패했습니다')
    return null
  }
  return await response.json()
}

export async function uploadImageToServer (imageFile: File): Promise<{ url: string } | null> {
  const apiCall = async (): Promise<Response> => {
    const formData = new FormData()
    formData.append('image', imageFile)
    return await fetch(HOST + '/v1/media/image', {
      method: 'POST',
      credentials: 'include',
      body: formData
    })
  }

  const response = await withAuthRetry(apiCall)
  if (!response.ok) {
    console.error('이미지 업로드에 실패했습니다')
    return null
  }
  return await response.json()
}

export async function fetchSearchResults (query: string): Promise<SimpleMemoInfo[] | null> {
  const apiCall = async (): Promise<Response> => {
    return await fetch(HOST + `/v1/memos?query=${query}`,
      {
        cache: 'no-store',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
  }

  const response = await withAuthRetry(apiCall)
  if (!response.ok) {
    console.error('폴더 검색에 실패했습니다')
    return null
  }
  const data = await response.json()
  return data.result.memos
}

export async function fetchReferencesByMemoId (memoId: string): Promise<SimpleMemoInfo[] | null> {
  const apiCall = async (): Promise<Response> => {
    return await fetch(HOST + `/v1/memos/${memoId}/references`,
      {
        cache: 'no-store',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
  }

  const response = await withAuthRetry(apiCall)
  if (!response.ok) {
    console.error('참조 메모 검색에 실패했습니다')
    return null
  }
  const data = await response.json()
  return data.references
}

export async function fetchReferencedByMemoId (memoId: string): Promise<SimpleMemoInfo[] | null> {
  const apiCall = async (): Promise<Response> => {
    return await fetch(HOST + `/v1/memos/${memoId}/referenced`,
      {
        cache: 'no-store',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
  }

  const response = await withAuthRetry(apiCall)
  if (!response.ok) {
    console.error('참조된 메모 검색에 실패했습니다')
    return null
  }
  const data = await response.json()
  return data.referenceds
}
