import {unstable_noStore as noStore} from 'next/cache';

export async function fetchMemo() {
  try {
  noStore()
    const response = await fetch('http://localhost:7777/api/v1/memos');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data.memos; // Make sure to return the memos
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}
