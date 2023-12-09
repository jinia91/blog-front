import {unstable_noStore as noStore} from 'next/cache';
import {mainUrl} from "@/api/host";

export async function fetchMemo() {
  try {
  noStore()
    const response = await fetch(mainUrl + '/v1/memo');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data.memos;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

export async function fetchRelatedMemo(keyword: string) {
  noStore()
  try {
    const response = await fetch(mainUrl + `/v1/memo?keyword=${keyword}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    console.log(data)
    return data.memos;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}