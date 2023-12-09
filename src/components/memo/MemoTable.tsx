"use client";
import React from "react";
import TabLink from "@/components/TabLink";
import {Memo} from "@/domain/Memo";

export default function MemoTable({ memos, className }: { memos: Memo[], className?: string }) {
  return (
    <div className={className}>
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
