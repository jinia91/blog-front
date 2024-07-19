import React, { useContext } from 'react'
import Image from 'next/image'
import { SidebarContext } from '@/components/ui-layout/sidebar/SiderBarProvider'
import menu from '../../../../public/menu.png'

export default function SideBarToggle (): React.ReactElement {
  const { toggleSideBarCollapse } = useContext(SidebarContext)
  return (
    <div className="md:hidden">
      <button
        className="text-2xl cursor-pointer rounded "
        onClick={toggleSideBarCollapse}
      >
        <Image src={menu} alt={'menu'} width={40} height={40}/>
      </button>
    </div>
  )
}
