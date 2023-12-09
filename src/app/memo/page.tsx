import MemoTable from "@/components/memo/MemoTable";
import MemoGraph from "@/components/memo/MemoGraph";
import {fetchMemo} from "@/api/memo";
import {Suspense} from "react";
import {Memo} from "@/domain/Memo";

export default async function Page() {
  const memos: Memo[] = await fetchMemo()
  return (
    <main className="dos-font flex h-96">
      <Suspense>
        <MemoGraph memos={memos} className={"bg-gray-900 overflow-hidden flex flex-grow border-2 w-80"}/>
      </Suspense>
      <Suspense>
        <MemoTable memos={memos} className={"flex flex-1"}/>
      </Suspense>
    </main>
  )
}
