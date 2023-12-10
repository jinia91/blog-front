import MemoEditor from "@/components/memo/MemoEditor";
import {fetchMemo, fetchMemoById} from "@/api/memo";
import {Memo} from "@/domain/Memo";

export default async function Page({params}: { params: { id: string } }) {
  const memos: Memo[] = await fetchMemo()
  const memo = await fetchMemoById(params.id);
  
  return (
    <main>
      <MemoEditor pageMemo={memo!!}
                  memos={memos}
      />
    </main>
  )
}
