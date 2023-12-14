import MemoGraph from "@/components/memo/MemoGraph";
import {fetchFolderAndMemo} from "@/api/memo";

export default async function Page() {
  const folders = await fetchFolderAndMemo();

  return (
    <main className="mb-4 flex-grow">
          <MemoGraph folders={folders} className={""}/>
    </main>
  
  )
}
