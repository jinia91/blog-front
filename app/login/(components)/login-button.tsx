import React from 'react'
import { type Provider } from '../(domain)/provider'
import { executeOAuthLoginRequest } from '../(usecase)/oauth-login-usecases'

interface LoginButtonProps {
  className?: string
  provider: Provider
  logo: React.ReactNode
  title: string
}

async function redirectOAuthLoginPage (provider: string): Promise<void> {
  const url = await executeOAuthLoginRequest(provider)
  window.location.href = url.url
}

export const LoginButton: React.FC<LoginButtonProps> = ({ className, provider, logo, title }) => (
  <button
    onClick={() => {
      redirectOAuthLoginPage(provider).catch((err) => {
        console.error('Error:', err)
      })
    }}
    className={className}
  >
    {logo}
    <span>{title}</span>
  </button>
)
