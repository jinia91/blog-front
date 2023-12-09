"use client";
import React, {useEffect, useState} from "react";
import TabLink from "@/components/TabLink";
import {Memo} from "@/domain/Memo";

export default function MemoTable({memos, underwritingId, underwritingTitle, className}: {
  memos: Memo[],
  underwritingId?: string | null,
  underwritingTitle?: string,
  className?: string
}) {
  const [newMemoTitle, setNewMemoTitle] = useState<string | null>(underwritingTitle ?? null);
  
  useEffect(() => {
    setNewMemoTitle(underwritingTitle ?? null);
  }, [underwritingTitle]);
  
  const hasUnderwritingMemo = memos.some((memo) => memo.memoId.toString() === underwritingId);
  
  return (
    <div className={className}>
      <ul className="flex-grow overflow-auto text-white border-2">
        {memos.map((memo, index) => (
          <TabLink key={index} name={memo.title} href={"/memo/" + memo.memoId}>
            <li
              className={`p-2 rounded cursor-pointer border-b ${
                memo.memoId.toString() === underwritingId ? "bg-gray-600" : "hover:bg-gray-600"
              }`}
            >
              {memo.memoId.toString() === underwritingId ? newMemoTitle : memo.title}
            </li>
          </TabLink>
        ))}
        
        {!hasUnderwritingMemo && underwritingId !== undefined && (
          <li className="p-2 bg-gray-600 rounded cursor-pointer border-b">
            {newMemoTitle?.length === 0 ? "새로운 메모를 작성해주세요" : newMemoTitle}
          </li>
        )}
        <button className={"bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"}>
          <TabLink name={"new"} href={"/memo/new"}>
            {"newMemo"}
          </TabLink>
        </button>
      </ul>
    </div>
  )
}
