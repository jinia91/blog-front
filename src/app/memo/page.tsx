import MemoTable from "@/components/memo/MemoTable";
import MemoGraph from "@/components/memo/MemoGraph";
import {SimpleMemo} from "@/components/modal";
import {fetchMemo} from "@/api/memo";
import {Suspense} from "react";

export default async function Page() {
  const memos: SimpleMemo[] = await fetchMemo()
  return (
    <main className="dos-font flex h-96">
      <Suspense>
        <MemoTable memos={memos}/>
      </Suspense>
      <Suspense>
        <MemoGraph memos={memos}/>
      </Suspense>
    </main>
  )
}
