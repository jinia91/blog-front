'use client'

import React from 'react'
import { useTabBarAndRouter } from '../../(usecase)/tab-usecases'
import { type ApplicationType } from '../../(domain)/tab'
import Link from 'next/link'

export default function TabOpen ({ name, href, type, children }: {
  name: string
  href: string
  type?: ApplicationType
  children: React.ReactNode
}): React.ReactElement {
  const { upsertAndSelectTab } = useTabBarAndRouter()
  return (
    <Link
      onClick={() => {
        upsertAndSelectTab({ name, urlPath: href, type })
      }}
      href={href}
    >
      {children}
    </Link>
  )
}
