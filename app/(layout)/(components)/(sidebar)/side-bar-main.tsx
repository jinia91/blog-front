'use client'

import React, { useEffect } from 'react'
import TabOpen from '../(tap-system)/tab-open'
import { sideBarItems } from './side-bar-items'
import { Auth } from '../../../login/(domain)/session'
import { useSession } from '../../../login/(usecase)/session-usecases'
import { useSideBar } from '../../(usecase)/side-bar-usecases'
import { GiHamburgerMenu } from 'react-icons/gi'

export default function SideBarMain (): React.ReactElement {
  const { isCollapsed, setCollapsed, toggleSideBarCollapse }: {
    isCollapsed: boolean
    setCollapsed: (isCollapsed: boolean) => void
    toggleSideBarCollapse: () => void
  } = useSideBar()
  const sidebarWidth = isCollapsed ? 'w-0 md:w-20' : ' w-96 md:w-72'
  const overlayStyle = isCollapsed ? 'invisible md:visible opacity-0 md:opacity-100 md:inline' : 'opacity-100'
  const { session } = useSession()

  useEffect(() => {
    if (isCollapsed) {
      document.removeEventListener('click', toggleSideBarCollapse)
    } else {
      document.addEventListener('click', toggleSideBarCollapse)
    }
    return () => {
      document.removeEventListener('click', toggleSideBarCollapse)
    }
  }, [toggleSideBarCollapse])

  return (
    <div className={`
    transform ${sidebarWidth} transition-width duration-300 ease-in-out h-full`}
    >
      <aside className="p-4 h-full">
        <div className={'hidden sm:flex pt-2 pb-4 mb-4 border-b border-gray-300 justify-between items-center truncate'}>
          <div
            className={'cursor-pointer flex pl-1'}
            onClick={toggleSideBarCollapse}
          >
            <GiHamburgerMenu className={'text-4xl'}/>
            <span
              className={`retro-font pl-2 text-2xl ${overlayStyle} transition-all duration-300 ease-in-out`}
            >
              {'Hello_World'}
          </span>
          </div>
          {!isCollapsed && (
            <button
              className={`retro-font cursor-pointer rounded focus:outline-none focus:ring ${overlayStyle}`}
              onClick={toggleSideBarCollapse}
            >
              X
            </button>
          )}
        </div>
        <ul className={'list-none'}>
          {sideBarItems.map(({ name, href, icon: Icon, auth, type }) => {
            if (auth === Auth.Guest ||
              (auth === Auth.User && session !== null) ||
              (auth === Auth.Admin && session?.roles.values().next().value === Auth.Admin)) {
              if (type === 'link') {
                return (
                  <li key={name} onClick={() => window.open(href, '_blank')}
                      className="flex items-center mb-2 overflow-auto truncate cursor-pointer pb-2 group">
                    <span
                      className="inline-block text-3xl pl-2 mr-2 transform transition-transform duration-300 group-hover:scale-125"><Icon/></span>
                    <span
                      className={`retro-font inline-block text-2xl transition-all duration-300 ease-in-out ${overlayStyle}`}>
                      {name}
                    </span>
                  </li>
                )
              } else {
                return (
                  <TabOpen name={name} href={href} key={name}>
                    <li onClick={() => {
                      setCollapsed(true)
                    }}
                        className="flex items-center mb-2 overflow-auto truncate cursor-pointer pb-2 group">
                      <span
                        className="inline-block text-3xl pl-2 mr-2 transform transition-transform duration-300 group-hover:scale-125"><Icon/></span>
                      <span
                        className={`retro-font inline-block text-2xl transition-all duration-300 ease-in-out ${overlayStyle}`}>
                        {name}
                      </span>
                    </li>
                  </TabOpen>
                )
              }
            }
            return null
          })}
        </ul>
      </aside>
    </div>
  )
};
