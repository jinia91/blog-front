import { mainUrl } from '@/outbound/api/host'

export async function getOAuthLoginUrl (provider: string): Promise<{ url: string } | null> {
  const response = await fetch(mainUrl + `/v1/auth/${provider}/url`, {
    method: 'GET',
    credentials: 'include'
  })
  if (!response.ok) {
    console.error(response.statusText)
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
  try {
    const response = await fetch(mainUrl + `/v1/auth/${provider}/login`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ code }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching memo:', error)
    return null
  }
}

export async function refreshTokens (): Promise<boolean> {
  try {
    const response = await fetch(mainUrl + '/v1/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    })
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    await response.json()
    return true
  } catch (error) {
    console.error('Error fetching memo:', error)
    return false
  }
}

export async function withAuthRetry (apiFunction: () => Promise<Response>): Promise<Response> {
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await apiFunction()
    if (response.status === 401) {
      const refreshResult = await refreshTokens()
      console.log('refreshResult', refreshResult)
      if (!refreshResult) {
        throw new Error('Unable to refresh tokens')
      }
      return await apiFunction()
    }
    return response
  } catch (error) {
    throw error
  }
}
