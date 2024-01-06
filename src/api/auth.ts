import { mainUrl } from '@/api/host'
import { type Session } from '@/api/session'

export async function getOAuthLoginUrl (provider: string): Promise<{ url: string } | null> {
  try {
    const response = await fetch(mainUrl + `/v1/auth/${provider}/url`, {
      method: 'GET'
    })
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    console.log('response', response)
    return await response.json()
  } catch (error) {
    console.error('Error fetching memo:', error)
    return null
  }
}

export async function oAuthLogin (provider: string, code: string): Promise<Session | null> {
  try {
    const response = await fetch(mainUrl + `/v1/auth/${provider}/login`, {
      method: 'POST',
      body: JSON.stringify({ code }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    console.log('response', response)
    return await response.json()
  } catch (error) {
    console.error('Error fetching memo:', error)
    return null
  }
}
