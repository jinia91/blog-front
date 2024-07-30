'use client'

import DarkLightToggle from '@/components/system/top/DarkLightToggle'
import React from 'react'
import SideBarToggle from '@/components/system/top/SideBarToggle'
import TabOpen from '@/components/system/tap_system/TabOpen'
import SigninAndOutButton from '@/components/system/top/SigninAndOutButton'

export default function TopNav (): React.ReactElement {
  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-center py-4">
        <SideBarToggle/>
        <TabOpen name={'Home'} href="/">
          <span className="retro-font-animation text-2xl font-semibold hover:cursor-pointer">
          {"__JINIA'S_LOG__!!"}
          </span>
        </TabOpen>
        <div className="flex items-center">
          <SigninAndOutButton/>
          <DarkLightToggle/>
        </div>
      </div>
    </div>
  )
}
