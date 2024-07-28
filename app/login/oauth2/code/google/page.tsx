'use client'
'use strict'

import React from 'react'
import { useLoginWithCodeOfProvider } from '@/auth/adapter/inbound/hook/UseLoginWithCodeOfProvider'

export default function Page (): React.ReactElement {
  useLoginWithCodeOfProvider()
  return (
    <></>
  )
}
