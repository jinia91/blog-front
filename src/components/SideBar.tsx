"use client";
import Image from "next/image";
import {AiOutlineHome} from "react-icons/ai";
import {BsPeople} from "react-icons/bs";
import {TiContacts} from "react-icons/ti";
import {FiMail} from "react-icons/fi";
import {useContext} from "react";
import {SidebarContext} from "@/components/ui-context/SideBarContext";

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
  const sidebarWidth = isCollapsed ? 'w-0 md:w-20' : 'w-96 md:w-64';
  const textWidth = isCollapsed ? 'w-0' : 'w-auto';
  const overlayStyle = isCollapsed ? 'hidden md:inline' : '';
  return (
    <div className={`
    transform ${sidebarWidth} transition-width duration-300 ease-in-out
    `}>
      <aside className="p-4 h-full">
        <div className="pb-4 mb-4 border-b border-gray-300 flex justify-between items-center">
          <div>
            <span
              className={`cursor-pointer ${overlayStyle} transition-all duration-300:ease-in-out`}
              onClick={toggleSideBarCollapse}>
            J
            </span>
            <span
              className={`cursor-pointer whitespace-nowrap overflow-hidden ${textWidth} transition-all duration-300:ease-in-out`}
              style={{opacity: isCollapsed ? 0 : 1, maxWidth: isCollapsed ? '20px' : 'auto'}}
              onClick={toggleSideBarCollapse}>
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              inia's Log
          </span>
          </div>
          {!isCollapsed && (
            <button
              className="cursor-pointer rounded focus:outline-none focus:ring"
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
                <span className="inline-block text-md mr-2"><Icon/></span>
                <span className={`inline-block transition-all duration-300 ease-in-out ${textWidth}`}
                      style={{opacity: isCollapsed ? 0 : 1, maxWidth: isCollapsed ? '20px' : 'auto'}}
                >
                  {name}
                </span>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
};
