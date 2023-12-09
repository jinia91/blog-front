import MemoEditor from "@/components/memo/MemoEditor";
import {fetchMemo} from "@/api/memo";
import {Memo} from "@/domain/Memo";

export default async function Page({params}: { params: { id: string } }) {
  const id = params.id;
  const memos: Memo[] = await fetchMemo()
  
  return (
    <main>
      <MemoEditor pageMemoId={id}
                  memos={memos}
      />
    </main>
  )
}
