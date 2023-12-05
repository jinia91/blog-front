"use client";
import Link from "next/link";
import {Url} from "url";
import React, {useContext} from "react";
import {TabBarContext} from "@/components/TabWindow";
import * as url from "url";

export default function TabLink({href, children}: { href: string, children: React.ReactNode }) {
  const {selectTab, addTab} = useContext(TabBarContext)
  
  return (
    <Link href={href} onClick={addTab}>
      {children}
    </Link>
  )
}
