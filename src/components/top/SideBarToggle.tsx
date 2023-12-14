import {useContext, useState} from "react";
import Image from "next/image";
import {SidebarContext} from "@/components/sidebar/SiderBarProvider";
import menu from '../../../public/menu.png'


export default function SideBarToggle() {
  const {isCollapsed, toggleSideBarCollapse} = useContext(SidebarContext);
  
  return (
    <div className="md:hidden">
      <button
        className="text-2xl cursor-pointer rounded "
        onClick={toggleSideBarCollapse}
      >
        <Image src={menu} alt={"menu"} width={40} height={40}/>
      </button>
    </div>
  )
}
