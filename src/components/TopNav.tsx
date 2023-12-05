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
        <Link href="#" className="text-2xl font-semibold">
          <span className="retro-font-animation">
          {"__JINIA'S_LOG__!!"}
          </span>
        </Link>
        <DarkLightToggle/>
      </div>
    </div>
  );
}
