import MemoGraph from "@/components/memo/memo_graph/MemoGraph";
import {fetchFolderAndMemo} from "@/api/memo";

export default async function Page() {
  return (
    <main className="mb-4 flex-grow">
          <MemoGraph className={""}/>
    </main>
  
  )
}
