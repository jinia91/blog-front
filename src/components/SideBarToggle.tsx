import {useContext, useState} from "react";
import {SidebarContext} from "@/components/ui-context/SideBarContext";
import Image from "next/image";


export default function SideBarToggle() {
  console.log("사이드바 토글 렌더링")
  
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
