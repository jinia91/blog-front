'use client'
'use strict'

import React from 'react'
import { useLoginWithCode } from '@/auth/controller/event/UseLoginWithCode'

export default function Page (): React.ReactElement {
  useLoginWithCode()
  return (
    <></>
  )
}
