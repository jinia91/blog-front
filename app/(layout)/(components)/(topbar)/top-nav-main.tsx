'use client'
import DarkLightToggle from './dark-light-toggle'
import React from 'react'
import SideBarToggle from './side-bar-toggle'
import TabOpen from '../(tap-system)/tab-open'
import SignInAndOutButton from './sign-in-and-out-button'
import NewArticleButton from '../../../blog/(components)/new-article-button'

export default function TopNavMain (): React.ReactElement {
  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-center py-4">
        <SideBarToggle/>
        <TabOpen name={'Home'} href="/">
          <div className={'sm:inline hidden'}>
          <span className="retro-font-animation text-2xl font-semibold hover:cursor-pointer">
          {"__JINIA'S_LOG__!!"}
          </span>
          </div>
        </TabOpen>
        <div className="flex items-center space-x-3">
          <SignInAndOutButton/>
          <DarkLightToggle/>
          <NewArticleButton/>
        </div>
      </div>
    </div>
  )
}
