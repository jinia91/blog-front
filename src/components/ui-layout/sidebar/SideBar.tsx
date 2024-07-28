'use client'

import React, { useContext, useEffect } from 'react'
import TabLink from '@/components/ui-layout/tap_system/TabLink'
import { sideBarItems } from '@/components/ui-layout/sidebar/sideBarItems'
import { SidebarContext } from '@/components/ui-layout/sidebar/SiderBarProvider'
import { AuthSessionContext } from '@/auth/adapter/provider/AuthSessionProvider'
import { Auth, type Session } from '@/auth/application/domain/Session'

export default function Sidebar (): React.ReactElement {
  const { isCollapsed, toggleSideBarCollapse }: {
    isCollapsed: boolean
    toggleSideBarCollapse: () => void
  } = useContext(SidebarContext)
  const sidebarWidth = isCollapsed ? 'w-0 md:w-20' : 'w-96 md:w-72'
  const overlayStyle = isCollapsed ? 'invisible md:visible opacity-0 md:opacity-100 md:inline' : 'opacity-100'
  const { session }: { session: Session } = useContext(AuthSessionContext)

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
    transform ${sidebarWidth} transition-width duration-300 ease-in-out`}
    >
      <aside className="p-4 h-full">
        <div className={'pt-2 pb-4 mb-4 border-b border-gray-300 flex justify-between items-center truncate'}>
          <div
            className={`cursor-pointer ${overlayStyle}`}
            onClick={toggleSideBarCollapse}
          >
            <span
              className={` text-3xl ${overlayStyle} transition-all duration-300:ease-in-out pb-1 pr-1 pl-1 rounded-xl border-2`}
            >
            {'>_'}
            </span>
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
        <ul className={`list-none ${overlayStyle}`}>
          {sideBarItems.map(({ name, href, icon: Icon, auth }) => {
            if (auth === Auth.Guest ||
              (auth === Auth.User && session !== null) ||
              // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
              (auth === Auth.Admin && session?.roles.values().next().value === 'ADMIN')) {
              return (
                <TabLink name={name} href={href} key={name}>
                  <li
                    className="flex items-center mb-2 last:mb-0 overflow-auto truncate cursor-pointer hover:bg-gray-800 pb-2"
                  >
                    <span className="inline-block text-3xl pl-2 mr-2"><Icon/></span>
                    <span
                      className={`retro-font inline-block text-2xl transition-all duration-300 ease-in-out ${overlayStyle}`}>
                  {name}
                </span>
                  </li>
                </TabLink>
              )
            }
            return null
          })}
        </ul>
      </aside>
    </div>
  )
};
