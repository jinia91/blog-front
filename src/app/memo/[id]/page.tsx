import MemoEditor from "@/components/memo/MemoEditor";

export default async function Page({params}: { params: { id: string } }) {
  
  return (
    <main className={"mb-4 flex-grow overflow-auto"}>
      <MemoEditor pageMemoNumber={params.id}
      />
    </main>
  )
}
