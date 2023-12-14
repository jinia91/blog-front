import {useContext, useState} from "react";
import Image from "next/image";
import {SidebarContext} from "@/components/sidebar/SiderBarProvider";


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
