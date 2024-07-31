import React from 'react'
import Image from 'next/image'
import menu from '../../../../public/menu.png'
import { useSideBar } from '../../(usecase)/SideBarUseCases'

export default function SideBarToggle (): React.ReactElement {
  const { toggleSideBarCollapse } = useSideBar()
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
