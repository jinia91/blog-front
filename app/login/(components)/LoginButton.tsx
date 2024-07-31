import React from 'react'
import { type Provider } from '../(domain)/provider'
import { executeOAuthLoginRequest } from '../(usecase)/OAuthLoginRequestUseCase'

interface LoginButtonProps {
  className?: string
  provider: Provider
  logo: React.ReactNode
  title: string
}

async function handleAuthLoginRequest (provider: string): Promise<void> {
  const url = await executeOAuthLoginRequest(provider)
  if (url == null) {
    console.error('로그인 리다이렉트 URL이 없습니다.')
    return
  }
  window.location.href = url.url
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
