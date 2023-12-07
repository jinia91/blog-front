"use client";
import dynamic from "next/dynamic";

const MemoGraph = dynamic(
  () => import('@/components/MemoGraph'),
  { ssr: false } // 클라이언트 사이드에서만 렌더링
);

export default function about() {
  console.log("메모뷰 렌더링")
  
  return (
    <main className="dos-font">
      <MemoGraph/>
    </main>
  )
}
