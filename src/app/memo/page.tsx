"use client";
import MemoEditor from "@/components/MemoWebsocket";

export default function about() {
  console.log("about 렌더링")
  
  return (
    <main className="dos-font">
      <MemoEditor/>
    </main>
  )
}
