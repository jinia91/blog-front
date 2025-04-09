import { type NextRequest } from 'next/server'
import { HOST } from '../(utils)/constants'

export const dynamic = 'force-dynamic'

export async function GET (req: NextRequest): Promise<Response> {
  const apiCall = async (): Promise<Response> => {
    return await fetch(HOST + '/seo/sitemap', {
      method: 'GET',
      credentials: 'include'
    })
  }
  const response = await apiCall()
  if (!response.ok) {
    console.debug('사이트맵 조회 실패')
    return new Response('사이트맵 조회 실패', { status: 500 })
  }

  return new Response(await response.text(), {
    status: 200,
    headers: {
      'Content-Type': 'application/xml'
    }
  })
}
