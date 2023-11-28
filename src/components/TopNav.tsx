"use client";
import DarkLightSwitch from "@/components/ui-context/DarkLightSwitch";
import React from "react";
import Link from "next/link";

export default function TopNav() {
  console.log("탑네비 렌더링")
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center py-4 md:justify-start md:space-x-10">
        <Link href="#" className="text-lg font-semibold">
          헤더부분입니다
        </Link>
        <DarkLightSwitch/>
      </div>
    </div>
  );
}
