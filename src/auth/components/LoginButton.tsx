import React from 'react'
import { type Provider } from '@/auth/application/domain/Provider'
import { handleAuthLoginRequest } from '@/auth/adapter/inbound/controller/AuthLoginRequestHandler'

interface LoginButtonProps {
  className?: string
  provider: Provider
  logo: React.ReactNode
  title: string
}

export const LoginButton: React.FC<LoginButtonProps> = ({ className, provider, logo, title }) => (
  <button
    onClick={() => {
      handleAuthLoginRequest(provider).catch((err) => {
        console.error('Error:', err)
      })
    }}
    className={className}
  >
    {logo}
    <span>{title}</span>
  </button>
)
