import MemoEditor from "@/components/memo/MemoEditor";
import {fetchMemo, fetchMemoById} from "@/api/memo";
import {Memo} from "@/domain/Memo";

export default async function Page({params}: { params: { id: string } }) {
  
  return (
    <main>
      <MemoEditor pageMemoNumber={params.id}
      />
    </main>
  )
}
