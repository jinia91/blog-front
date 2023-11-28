import {useContext, useState} from "react";
import {SidebarContext} from "@/components/ui-context/SideBarContext";

export default function SideBarToggle() {
  console.log("사이드바 토글 렌더링")
  
  const {isCollapsed, toggleSideBarCollapse} = useContext(SidebarContext);
  
  return (
    <div className="md:hidden">
      <button
        className="text-2xl cursor-pointer rounded focus:outline-none focus:ring"
        onClick={toggleSideBarCollapse}
      >
       ☰
      </button>
    </div>
  )
}
