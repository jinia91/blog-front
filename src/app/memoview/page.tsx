"use client";
import MemoEditor from "@/components/MemoWebsocket";
import MemoGraph from "@/components/MemoGraph";

export default function about() {
  console.log("메모뷰 렌더링")
  
  return (
    <main className="dos-font">
      <MemoGraph/>
    </main>
  )
}
