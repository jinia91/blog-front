'use client'
import DarkLightToggle from './dark-light-toggle'
import React from 'react'
import SideBarToggle from './side-bar-toggle'
import TabOpen from '../(tap-system)/tab-open'
import SignInAndOutButton from './sign-in-and-out-button'
import NewArticleButton from './new-article-button'

export default function TopNavMain (): React.ReactElement {
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
          <SignInAndOutButton/>
          <DarkLightToggle/>
          <NewArticleButton/>
        </div>
      </div>
    </div>
  )
}
