import { HOST } from '../../(utils)/constants'

export async function getOAuthLoginUrl (provider: string): Promise<{ url: string } | null> {
  const response = await fetch(HOST + `/v1/auth/${provider}/url`, {
    method: 'GET',
    credentials: 'include'
  })
  if (!response.ok) {
    return null
  }
  return await response.json()
}

export async function oAuthLogin (provider: string, code: string):
Promise<{
  nickName: string
  email: string
  roles: Set<string>
  picUrl: string
} | null> {
  const response = await fetch(HOST + `/v1/auth/${provider}/login`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({ code }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  if (!response.ok) {
    console.debug(response.statusText)
    return null
  }
  return await response.json()
}

export async function oAuthLogout (): Promise<boolean> {
  const response = await fetch(HOST + '/v1/auth/logout', {
    method: 'POST',
    credentials: 'include'
  })

  if (!response.ok) {
    console.debug(response.statusText)
    return false
  }

  return true
}

export async function refreshTokens (): Promise<{
  nickName: string
  email: string
  roles: Set<string>
  picUrl: string
} | null> {
  const response = await fetch(HOST + '/v1/auth/refresh', {
    method: 'POST',
    credentials: 'include'
  })
  if (!response.ok) {
    console.debug(response.statusText)
    return null
  }
  return await response.json()
}

export async function withAuthRetry (apiFunction: () => Promise<Response>): Promise<Response> {
  const response = await apiFunction()
  if (response.status === 401) {
    const refreshResult = await refreshTokens()
    if (refreshResult === null) {
      return response
    }
    return await apiFunction()
  }
  return response
}
