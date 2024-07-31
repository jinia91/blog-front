'use client'

import React from 'react'
import { useTabs } from '../../(usecase)/TabUseCases'
import { type ApplicationType } from '../../(domain)/tab'
import Link from 'next/link'

export default function TabOpen ({ name, href, type, children }: {
  name: string
  href: string
  type?: ApplicationType
  children: React.ReactNode
}): React.ReactElement {
  const { upsertAndSelectTab } = useTabs()
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
