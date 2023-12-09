"use client";
import React, {useEffect, useState} from "react";
import TabLink from "@/components/TabLink";
import {Memo} from "@/domain/Memo";
import {it} from "node:test";

export default function MemoTable({memos, underwritingId, underwritingTitle, className}: {
  memos: Memo[],
  underwritingId?: string | null,
  underwritingTitle?: string,
  className?: string
}) {
  const [newMemoId, setNewMemoId] = useState<string | null>(underwritingId ?? null);
  const [newMemoTitle, setNewMemoTitle] = useState<string | null>(underwritingTitle ?? null);
  
  useEffect(() => {
    console.log("underwritingTitle", underwritingTitle)
    setNewMemoTitle(underwritingTitle ?? null);
  }, [underwritingTitle]);
  
  const filteredMemos = memos.filter(memo => memo.memoId.toString() === newMemoId);
  console.log(filteredMemos)
  return (
    <div className={className}>
      <ul className="flex-grow overflow-auto text-white border-2">
        {filteredMemos.length > 0 ? (
          filteredMemos.map((memo, index) => (
            <li key={index} className="p-2 bg-gray-600 rounded cursor-pointer border-b">
              {newMemoTitle}
            </li>
          ))
        ) : underwritingId !== undefined ? (
          <li className="p-2 bg-gray-600 rounded cursor-pointer border-b">
            {newMemoTitle?.length === 0 ? "새로운 메모를 작성해주세요" : newMemoTitle}
          </li>
        ) : (<> </>)
        }        {memos.filter(
          memo => memo.memoId.toString() !== underwritingId
        ).map((memo, index) => (
          <li
            key={index}
            className="p-2 hover:bg-gray-600 rounded cursor-pointer border-b"
          >
            <TabLink name={memo.title} href={"/memo/" + memo.memoId}>
              {memo.title}
            </TabLink>
          </li>
        ))}
        <button className={"bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"}>
          <TabLink name={"new"} href={"/memo/new"}>
            {"newMemo"}
          </TabLink>
        </button>
      </ul>
    </div>
  )
}
