import MemoEditor from "@/components/memo/MemoEditor";
import {Suspense} from "react";
import MemoTable from "@/components/memo/MemoTable";
import {fetchMemo} from "@/api/memo";
import {Memo} from "@/domain/Memo";

export default async function Page({params} : {params: {id: string}}) {
  const id = params.id;
  const memos: Memo[] = await fetchMemo()
  
  return (
    <main className="dos-font flex flex-col md:flex-row">
      <Suspense>
        <MemoEditor pageMemoId={id}
                    className="bg-black text-green-400 font-mono p-4 flex flex-grow md:w-80 "/>
      </Suspense>
      <Suspense>
        <MemoTable memos={memos} className="flex flex-1"/>
      </Suspense>
    </main>
  )
}
