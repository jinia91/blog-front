"use client";
import Image from "next/image";
import {AiOutlineHome} from "react-icons/ai";
import {BsPeople} from "react-icons/bs";
import {TiContacts} from "react-icons/ti";
import {FiMail} from "react-icons/fi";
import React, {useContext} from "react";
import {SidebarContext} from "@/components/DynamicLayout";
import {VT323} from "next/dist/compiled/@next/font/dist/google";
import Link from "next/link";
import TabLink from "@/components/TabLink";

const sidebarItems = [
  {
    name: "Home",
    href: "/",
    icon: AiOutlineHome,
  },
  {
    name: "About",
    href: "/about",
    icon: BsPeople,
  },
  {
    name: "Mails",
    href: "/mails",
    icon: FiMail,
  },
  {
    name: "Contact",
    href: "/contact",
    icon: TiContacts,
  },
];

export default function Sidebar() {
  console.log("사이드바 렌더링")
  const {isCollapsed, toggleSideBarCollapse} = useContext(SidebarContext);
  const sidebarWidth = isCollapsed ? 'w-0 md:w-20' : 'w-96 md:w-72';
  const textWidth = isCollapsed ? 'w-0' : 'w-auto';
  const overlayStyle = isCollapsed ? 'opacity-0 md:opacity-100 md:inline' : 'opacity-100';
  return (
    <div className={`
    transform ${sidebarWidth} transition-width duration-300 ease-in-out
    `}>
      <aside className="p-4 h-full">
        <div className="pb-4 mb-4 border-b border-gray-300 flex justify-between items-center">
          <div>
            <span
              className={`cursor-pointer text-3xl ${overlayStyle} transition-all duration-300:ease-in-out`}
              onClick={toggleSideBarCollapse}>
            {'>_'}
            </span>
            <span
              className={`retro-font pl-2 cursor-pointer text-2xl whitespace-nowrap overflow-hidden ${textWidth} transition-all duration-300:ease-in-out`}
              style={{opacity: isCollapsed ? 0 : 1, maxWidth: isCollapsed ? '20px' : 'auto'}}
              onClick={toggleSideBarCollapse}>
              {'Hello_World'}
          </span>
          </div>
          {!isCollapsed && (
            <button
              className="retro-font cursor-pointer rounded focus:outline-none focus:ring"
              onClick={toggleSideBarCollapse}
            >
              X
            </button>
          )}
        </div>
        <ul className={`list-none ${overlayStyle}`}>
          {sidebarItems.map(({name, href, icon: Icon}) => {
            return (
              <li className="flex items-center mb-2 last:mb-0" key={name}>
                <TabLink href={href}>
                  <span className="inline-block text-3xl pl-2 mr-2"><Icon/></span>
                  <span
                    className={`retro-font inline-block text-2xl transition-all duration-300 ease-in-out ${textWidth}`}
                    style={{opacity: isCollapsed ? 0 : 1, maxWidth: isCollapsed ? '20px' : 'auto'}}
                  >
                  {name}
                </span>
                </TabLink>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
};
