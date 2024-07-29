'use client'

import React, { useContext } from 'react'
import { MemoEditContext } from '@/components/memo/MemoEditContextProvider'
import { useTabs } from '@/system/application/usecase/TabUseCases'

export default function TabLink ({ name, href, children }: {
  name: string
  href: string
  children: React.ReactNode
}): React.ReactElement {
  const { tabs, setTabs, selectTab } = useTabs()
  const { setUnderwritingId } = useContext(MemoEditContext)
  const isMemoTab = href.startsWith('/memo/')

  const addTab = (): void => {
    if (!isMemoTab) {
      setUnderwritingId('')
    }

    const existingTabIndex = tabs.findIndex(function (tab: any) {
      return tab.context === href
    })

    if (existingTabIndex !== -1) {
      selectTab(existingTabIndex)
    } else {
      const newTab = { name, urlPath: href }
      const updatedTabs = [...tabs, newTab]
      setTabs(updatedTabs)
      selectTab(updatedTabs.length - 1)
    }
  }

  return (
    <div onClick={addTab}>
      {children}
    </div>
  )
}
