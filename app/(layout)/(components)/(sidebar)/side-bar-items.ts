import { AiOutlineFileText, AiTwotoneBook } from 'react-icons/ai'
import { BsPeople, BsTerminalDash } from 'react-icons/bs'
import { Auth } from '../../../login/(domain)/session'

export const sideBarItems = [
  {
    name: 'Home',
    href: '/',
    icon: BsTerminalDash,
    auth: Auth.Guest
  },
  {
    name: 'About',
    href: '/about',
    icon: BsPeople,
    auth: Auth.Guest
  },
  {
    name: 'Memo',
    href: '/memo',
    icon: AiOutlineFileText,
    auth: Auth.User
  },
  {
    name: 'Blog',
    href: '/blog',
    icon: AiTwotoneBook,
    auth: Auth.Guest
  }
]
