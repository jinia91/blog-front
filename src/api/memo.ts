import { unstable_noStore as noStore } from 'next/cache'
import { mainUrl } from '@/api/host'
import { type FolderInfo, type Memo, type SimpleMemoInfo } from '@/api/models'

export async function createMemo (authorId: string): Promise<{ memoId: number } | null> {
  try {
    const response = await fetch(mainUrl + '/v1/memos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ authorId })
    })
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
  try {
    const response = await fetch(mainUrl + `/v1/memos?keyword=${keyword}&thisId=${thisId}`, { cache: 'no-store' })
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await response.json()
    console.log(data.memos)
    return data.memos
  } catch (error) {
    console.error('Error fetching memo:', error)
    return null
  }
}

export async function fetchMemoById (id: string): Promise<Memo | null> {
  noStore()
  try {
    const response = await fetch(mainUrl + `/v1/memos/${id}`)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching memo:', error)
    return null
  }
}

export async function deleteMemoById (id: string): Promise<any> {
  try {
    const response = await fetch(mainUrl + `/v1/memos/${id}`, {
      method: 'DELETE'
    })
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
  try {
    const response = await fetch(mainUrl + '/v1/folders')
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

export async function createFolder (authorId: string): Promise<{ folderId: number, folderName: string } | null> {
  noStore()
  try {
    const response = await fetch(mainUrl + '/v1/folders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ authorId })
    })
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching memo:', error)
    return null
  }
}

export async function changeFolderName (folderId: string, toBeName: string): Promise<any> {
  try {
    const response = await fetch(mainUrl + `/v1/folders/${folderId}/name`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ folderId, name: toBeName })
    })
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching memo:', error)
    return null
  }
}

export async function deleteFolderById (folderId: string): Promise<any> {
  try {
    const response = await fetch(mainUrl + `/v1/folders/${folderId}`, {
      method: 'DELETE'
    })
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching memo:', error)
    return null
  }
}

export async function makeRelationshipWithFolders (childFolderId: string, parentFolderId: string | null): Promise<any> {
  try {
    const response = await fetch(mainUrl + `/v1/folders/${childFolderId}/parent/${parentFolderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    })
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
  try {
    const response = await fetch(mainUrl + `/v1/memos/${memoId}/folders/${folderId ?? -1}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching memo:', error)
    return null
  }
}

export async function uploadImage (imageFile: File, authorId: string): Promise<{ url: string } | null> {
  try {
    console.log(imageFile)
    const formData = new FormData()
    formData.append('image', imageFile)

    const response = await fetch(mainUrl + '/v1/media/image', {
      method: 'POST',
      body: formData
    })
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
  try {
    const response = await fetch(mainUrl + `/v1/folders?query=${query}`, { cache: 'no-store' })
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
    const response = await fetch(mainUrl + `/v1/memos/${memoId}/references`, { cache: 'no-store' })
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
  try {
    const response = await fetch(mainUrl + `/v1/memos/${memoId}/referenced`, { cache: 'no-store' })
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
