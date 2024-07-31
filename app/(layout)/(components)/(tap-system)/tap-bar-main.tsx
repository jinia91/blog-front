import React, { useEffect } from 'react'
import { TabBar } from './tab-bar'
import { usePathname } from 'next/navigation'
import { useTabs } from '../../(usecase)/tab-usecases'

export function TapBarMain (): React.ReactElement {
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
