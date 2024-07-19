'use client'

import DarkLightToggle from '@/components/ui-layout/top/DarkLightToggle'
import React from 'react'
import SideBarToggle from '@/components/ui-layout/top/SideBarToggle'
import TabLink from '@/components/ui-layout/tap_system/TabLink'
import SignInAndOutBox from '@/components/ui-layout/top/SigninAndOutBox'

export default function TopNav (): React.ReactElement {
  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-center py-4">
        <SideBarToggle/>
        <TabLink name={'Home'} href="/">
          <span className="retro-font-animation text-2xl font-semibold hover:cursor-pointer">
          {"__JINIA'S_LOG__!!"}
          </span>
        </TabLink>
        <div className="flex items-center">
          <SignInAndOutBox/>
          <DarkLightToggle/>
        </div>
      </div>
    </div>
  )
}
