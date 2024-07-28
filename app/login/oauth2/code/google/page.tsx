'use client'
'use strict'

import React from 'react'
import { useLoginWithCode } from '@/auth/adapter/inbound/hook/UseLoginWithCode'

export default function Page (): React.ReactElement {
  useLoginWithCode()
  return (
    <></>
  )
}
