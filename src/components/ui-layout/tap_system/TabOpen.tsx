'use client'

import React from 'react'
import { useTabs } from '@/system/application/usecase/TabUseCases'
import { type ApplicationType } from '@/system/application/domain/Tab'

export default function TabOpen ({ name, href, type, children }: {
  name: string
  href: string
  type?: ApplicationType
  children: React.ReactNode
}): React.ReactElement {
  const { addAndSelectTab } = useTabs()
  return (
    <div onClick={() => {
      addAndSelectTab({ name, urlPath: href, type })
    }}>
      {children}
    </div>
  )
}
