import {useContext, useState} from "react";
import {SidebarContext} from "@/layout/DynamicLayout";
import Image from "next/image";


export default function SideBarToggle() {
  const {isCollapsed, toggleSideBarCollapse} = useContext(SidebarContext);
  
  return (
    <div className="md:hidden">
      <button
        className="text-2xl cursor-pointer rounded "
        onClick={toggleSideBarCollapse}
      >
        <Image src={"/menu.png"} alt={"menu"} width={40} height={40}/>
      </button>
    </div>
  )
}
