import MemoTable from "@/components/memo/MemoTable";
import MemoGraph from "@/components/memo/MemoGraph";
import {fetchSimpleMemo} from "@/api/memo";
import {Suspense} from "react";
import {Memo, SimpleMemo} from "@/domain/Memo";

export default async function Page() {
  const memos: SimpleMemo[] = await fetchSimpleMemo()

  return (
    <main className="mb-4 flex-grow">
          <MemoGraph memos={memos} className={""}/>
    </main>
  
  )
}
