import { unstable_noStore as noStore } from 'next/cache'
import { mainUrl } from '@/api/host'
import { type FolderInfo, type Memo, type SimpleMemoInfo } from '@/api/models'
import { withAuthRetry } from '@/api/auth'

export async function createMemo (): Promise<{ memoId: number } | null> {
  const apiCall = async (): Promise<Response> => {
    return await fetch(mainUrl + '/v1/memos', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })
  }

  try {
    const response = await withAuthRetry(apiCall)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return await response.json()
  } catch (error) {
    console.error('Error creating memo:', error)
    return null
  }
}

export async function fetchRelatedMemo (keyword: string, thisId: string): Promise<Memo | null> {
  const apiCall = async (): Promise<Response> => {
    return await fetch(mainUrl + `/v1/memos/${thisId}/?keyword=${keyword}`,
      {
        cache: 'no-store',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
  }

  try {
    const response = await withAuthRetry(apiCall)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await response.json()
    return data.memos
  } catch (error) {
    console.error('Error fetching memo:', error)
    return null
  }
}

export async function fetchMemoById (id: string): Promise<Memo | null> {
  noStore()
  const apiCall = async (): Promise<Response> => {
    return await fetch(mainUrl + `/v1/memos/${id}`,
      {
        cache: 'no-store',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
  }

  try {
    const response = await withAuthRetry(apiCall)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await response.json()
    console.log('fetchedMemo:', data)
    return data
  } catch (error) {
    console.error('Error fetching memo:', error)
    return null
  }
}

export async function deleteMemoById (id: string): Promise<any> {
  const apiCall = async (): Promise<Response> => {
    return await fetch(mainUrl + `/v1/memos/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  try {
    const response = await withAuthRetry(apiCall)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return await response.json()
  } catch (error) {
    console.error('Error delete memo:', error)
    return null
  }
}

export async function fetchFolderAndMemo (): Promise<FolderInfo[] | null> {
  noStore()
  const apiCall = async (): Promise<Response> => {
    return await fetch(mainUrl + '/v1/folders',
      {
        cache: 'no-store',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
  }

  try {
    const response = await withAuthRetry(apiCall)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data: { folderInfos: FolderInfo[] } = await response.json()
    return data.folderInfos
  } catch (error) {
    console.error('Error fetching memo:', error)
    return null
  }
}

export async function createFolder (): Promise<{ folderId: number, folderName: string } | null> {
  noStore()
  const apiCall = async (): Promise<Response> => {
    return await fetch(mainUrl + '/v1/folders', {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  try {
    const response = await withAuthRetry(apiCall)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching memo:', error)
    return null
  }
}

export async function changeFolderName (folderId: string, toBeName: string): Promise<any> {
  const apiCall = async (): Promise<Response> => {
    return await fetch(mainUrl + `/v1/folders/${folderId}/name`, {
      credentials: 'include',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ folderId, name: toBeName })
    })
  }

  try {
    const response = await withAuthRetry(apiCall)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching memo:', error)
    return null
  }
}

export async function deleteFolderById (folderId: string): Promise<any> {
  const apiCall = async (): Promise<Response> => {
    return await fetch(mainUrl + `/v1/folders/${folderId}`, {
      credentials: 'include',
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  try {
    const response = await withAuthRetry(apiCall)
    if (!response.ok) {
      console.error('폴더 삭제 api 호출시 에러, 정상 삭제가 되지 않았습니다')
    }
    return await response.json()
  } catch (error) {
    console.error('폴더 삭제 api 호출시 에러', error)
    return null
  }
}

export async function makeRelationshipWithFolders (childFolderId: string, parentFolderId: string | null): Promise<any> {
  const apiCall = async (): Promise<Response> => {
    return await fetch(mainUrl + `/v1/folders/${childFolderId}/parent/${parentFolderId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  try {
    const response = await withAuthRetry(apiCall)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching memo:', error)
    return null
  }
}

export async function makeRelationshipWithMemoAndFolders (memoId: string, folderId: string | null): Promise<any> {
  const apiCall = async (): Promise<Response> => {
    return await fetch(mainUrl + `/v1/memos/${memoId}/parent`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ folderId })
    })
  }

  try {
    const response = await withAuthRetry(apiCall)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching memo:', error)
    return null
  }
}

export async function uploadImage (imageFile: File): Promise<{ url: string } | null> {
  const apiCall = async (): Promise<Response> => {
    const formData = new FormData()
    formData.append('image', imageFile)
    console.log(imageFile)
    return await fetch(mainUrl + '/v1/media/image', {
      method: 'POST',
      credentials: 'include',
      body: formData
    })
  }

  try {
    const response = await withAuthRetry(apiCall)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching memo:', error)
    return null
  }
}

export async function fetchSearchResults (query: string): Promise<FolderInfo[] | null> {
  const apiCall = async (): Promise<Response> => {
    return await fetch(mainUrl + `/v1/folders?query=${query}`,
      {
        cache: 'no-store',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
  }

  try {
    const response = await withAuthRetry(apiCall)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await response.json()
    return data.folderInfos
  } catch (error) {
    console.error('Error fetching memo:', error)
    return null
  }
}

export async function fetchReferencesByMemoId (memoId: string): Promise<SimpleMemoInfo[] | null> {
  try {
    const response = await fetch(mainUrl + `/v1/memos/${memoId}/references`,
      {
        cache: 'no-store',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await response.json()
    return data.references
  } catch (error) {
    console.error('Error fetching memo:', error)
    return null
  }
}

export async function fetchReferencedByMemoId (memoId: string): Promise<SimpleMemoInfo[] | null> {
  const apiCall = async (): Promise<Response> => {
    return await fetch(mainUrl + `/v1/memos/${memoId}/referenced`,
      {
        cache: 'no-store',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
  }

  try {
    const response = await withAuthRetry(apiCall)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await response.json()
    return data.referenceds
  } catch (error) {
    console.error('Error fetching memo:', error)
    return null
  }
}
