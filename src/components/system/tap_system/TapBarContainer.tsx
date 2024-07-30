import React, { useEffect } from 'react'
import { TabBar } from '@/components/system/tap_system/TabBar'
import { usePathname } from 'next/navigation'
import { useTabs } from '@/system/application/usecase/TabUseCases'

export function TapBarContainer (): React.ReactElement {
  const path = usePathname()
  const [mounted, setMounted] = React.useState(false)
  const { initializeTabs } = useTabs()

  useEffect(() => {
    initializeTabs(path)
    setMounted(true)
  }, [])

  if (!mounted) {
    return <></>
  }

  return (
    <TabBar/>
  )
}
