import { AiFillGithub, AiOutlineFileText } from 'react-icons/ai'
import { BsPeople, BsTerminalDash } from 'react-icons/bs'
import { Auth } from '../../../login/(domain)/session'
import { BlogIcon } from './blog-icon'
import { RssIcon } from './rss-feed-icon'
import { HOST } from '../../../(utils)/constants'

export const sideBarItems = [
  {
    name: 'Home',
    href: '/',
    icon: BsTerminalDash,
    auth: Auth.Guest,
    type: 'app'
  },
  {
    name: 'About',
    href: '/about',
    icon: BsPeople,
    auth: Auth.Guest,
    type: 'app'
  },
  {
    name: 'Memo',
    href: '/memo',
    icon: AiOutlineFileText,
    auth: Auth.User,
    type: 'app'
  },
  {
    name: 'Blog',
    href: '/blog',
    icon: BlogIcon,
    auth: Auth.Guest,
    type: 'app'
  },
  {
    name: 'Github',
    href: 'https://github.com/jinia91',
    icon: AiFillGithub,
    auth: Auth.Guest,
    type: 'link'
  },
  {
    name: 'Rss',
    href: HOST + '/seo/rss',
    icon: RssIcon,
    auth: Auth.Guest,
    type: 'link'
  }
]
