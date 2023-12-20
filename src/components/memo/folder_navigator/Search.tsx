import {FolderInfo} from "@/api/models";
import React, {Dispatch, SetStateAction, useState} from "react";
import Image from "next/image";
import search from "../../../../public/search.png";

export function Search({foldersRef, setFoldersRef, isInputVisible, setInputVisible}: {
  foldersRef: FolderInfo[],
  setFoldersRef: Dispatch<SetStateAction<FolderInfo[]>>,
  isInputVisible: boolean,
  setInputVisible: Dispatch<SetStateAction<boolean>>,
}){
  
  return (
    <div className={`flex flex-row-reverse ${isInputVisible ? 'w-full' : ''}`}>
      {isInputVisible && (
        <input
          type="text"
          className="w-10/12 bg-gray-800 border border-gray-700 text-white p-1 transition-all duration-500"
          placeholder="검색..."
        />
      )}
      <div className="tooltip relative flex-grow">
        <button
          className="text-white hover:text-gray-300"
          aria-label='search'
          type='button'
          onClick={() => setInputVisible(!isInputVisible)}
        >
          <Image src={search} alt={"검색"} width={30} height={30}/>
        </button>
        <span className="tooltip-message">검색</span>
      </div>
    </div>
)
  ;
}
