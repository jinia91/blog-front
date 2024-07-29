'use client'
import React, { createContext, useState } from 'react'

export const SidebarContext: React.Context<any> = createContext({ isCollapsed: true })

export default function SideBarProvider ({ children }: { children: React.ReactNode }): React.ReactElement {
  const [isCollapsed, setCollapse] = useState(true)

  const toggleSideBarCollapse = (): void => {
    setCollapse((prevState) => !prevState)
  }

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSideBarCollapse }}>
      {children}
    </SidebarContext.Provider>
  )
}
