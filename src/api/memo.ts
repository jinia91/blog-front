import {revalidatePath, revalidateTag, unstable_noStore as noStore} from 'next/cache';
import {mainUrl} from "@/api/host";
import {Memo} from "@/api/models";

export async function createMemo(authorId: string) {
  try {
    const response = await fetch(mainUrl + '/v1/memo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({authorId}),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating memo:', error);
    return null;
  }
}

export async function fetchRelatedMemo(keyword: string, thisId: string) {
  try {
    const response = await fetch(mainUrl + `/v1/memo?keyword=${keyword}&thisId=${thisId}`, {cache: 'no-store'});
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    console.log(data.memos)
    return data.memos;
  } catch (error) {
    console.error('Error fetching memo:', error);
    return null;
  }
}

export async function fetchMemoById(id: string) : Promise<Memo | null> {
  noStore()
  try {
    const response = await fetch(mainUrl + `/v1/memo/${id}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching memo:', error);
    return null;
  }
}

export async function deleteMemoById(id: string) {
  try {
    const response = await fetch(mainUrl + `/v1/memo/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error delete memo:', error);
    return null;
    
  }
}

export async function fetchFolderAndMemo() {
  noStore()
  try {
    const response = await fetch(mainUrl + `/v1/folder`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data.folderInfos;
  } catch (error) {
    console.error('Error fetching memo:', error);
    return null;
  }
}

export async function createFolder(authorId: string) {
  noStore()
  try {
    const response = await fetch(mainUrl + `/v1/folder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({authorId}),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching memo:', error);
    return null;
  }
}

export async function changeFolderName(folderId: string, toBeName: string) {
  try {
    const response = await fetch(mainUrl + `/v1/folder/${folderId}/name`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({folderId: folderId, name: toBeName}),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching memo:', error);
    return null;
  }
}

export async function deleteFolderById(folderId: string) {
  try {
    const response = await fetch(mainUrl + `/v1/folder/${folderId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching memo:', error);
    return null;
  }
}

export async function makeRelationshipWithFolders(childFolderId:string, parentFolderId:string | null) {
  try {
    const response = await fetch(mainUrl + `/v1/folder/${childFolderId}/parent/${parentFolderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching memo:', error);
    return null;
  }
}

export async function makeRelationshipWithMemoAndFolders(memoId:string, folderId:string | null) {
  try {
    const response = await fetch(mainUrl + `/v1/memo/${memoId}/folder/${folderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching memo:', error);
    return null;
  }
}
