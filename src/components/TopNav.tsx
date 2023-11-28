"use client";
import DarkLightToggle from "@/components/DarkLightToggle";
import React from "react";
import Link from "next/link";
import SideBarToggle from "@/components/SideBarToggle";

export default function TopNav() {
  console.log("탑네비 렌더링")
  
  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-center py-4">
        <SideBarToggle/>
        <Link href="#" className="text-lg font-semibold">
          헤더부분입니다
        </Link>
        <DarkLightToggle/>
      </div>
    </div>
  );
}
