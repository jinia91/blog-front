import MemoEditor from "@/components/memo/memo_editor/MemoEditor";

export default async function Page({params}: { params: { id: string } }) {
  
  return (
    <main className={"flex-grow"}>
      <MemoEditor pageMemoNumber={params.id}/>
    </main>
  )
}
