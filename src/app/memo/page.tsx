import MemoTable from "@/components/MemoTable";
import MemoGraph from "@/components/MemoGraph";
import {SimpleMemo} from "@/components/modal";
import {fetchMemo} from "@/api/memo";

export default async function Page() {
  const memos : SimpleMemo[] = await fetchMemo()
  return (
    <main className="dos-font flex h-96">
      <MemoTable memos={memos}/>
      <MemoGraph memos={memos}/>
    </main>
  )
}
