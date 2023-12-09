"use client";
import React from "react";
import {SimpleMemo} from "@/components/modal";
import TabLink from "@/components/TabLink";

export default function MemoTable({ memos }: { memos: SimpleMemo[] }) {
  console.log("메모테이블 렌더링", memos)
  
  return (
    <div className="flex flex-1">
      <ul className="flex-grow overflow-auto text-white border-2">
        {memos.map((memo, index) => (
          <li
            key={index}
            className="p-2 hover:bg-gray-600 rounded cursor-pointer border-b"
          >
            <TabLink name={memo.title} href={"/memo/" + memo.memoId}>
              {memo.title}
            </TabLink>
          </li>
        ))}
      </ul>
    </div>
  )
}
