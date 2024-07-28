'use client'
'use strict'

import React from 'react'
import { useLogin } from '@/auth/adapter/hook/OAtuhLoginProviderRouter'

export default function Page (): React.ReactElement {
  useLogin()
  return (
    <></>
  )
}
