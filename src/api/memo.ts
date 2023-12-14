import {revalidatePath, revalidateTag, unstable_noStore as noStore} from 'next/cache';
import {mainUrl} from "@/api/host";
import {Memo} from "@/domain/Memo";

export async function fetchSimpleMemo() {
  noStore()
  try {
    const response = await fetch(mainUrl + '/v1/memo', {cache: 'no-store'});
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    console.log("데이터", data.memos)
    return data.memos;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

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
    console.log("데이터", data.memo)
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
