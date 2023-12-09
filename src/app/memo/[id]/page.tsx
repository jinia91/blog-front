import MemoEditor from "@/components/memo/MemoEditor";
import {Suspense} from "react";
import MemoTable from "@/components/memo/MemoTable";
import {fetchMemo} from "@/api/memo";
import {Memo} from "@/domain/Memo";

export default async function Page({params}: { params: { id: string } }) {
  const id = params.id;
  const memos: Memo[] = await fetchMemo()
  
  return (
    <main className="">
      <MemoEditor pageMemoId={id}
                  memos={memos}
      />
    </main>
  )
}
