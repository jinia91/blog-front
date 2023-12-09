"use client";

import DarkLightToggle from "@/components/top/DarkLightToggle";
import React from "react";
import Link from "next/link";
import SideBarToggle from "@/components/top/SideBarToggle";
import TabLink from "@/components/TabLink";

export default function TopNav() {
  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-center py-4">
        <SideBarToggle/>
        <TabLink name={"Home"} href="/">
          <span className="retro-font-animation text-2xl font-semibold">
          {"__JINIA'S_LOG__!!"}
          </span>
        </TabLink>
        <DarkLightToggle/>
      </div>
    </div>
  );
}
