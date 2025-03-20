import { vi } from 'vitest'
import * as mockRouter from 'next-router-mock'
import MockRouter from 'next-router-mock'

const useRouter = mockRouter.useRouter

process.env.NEXT_PUBLIC_HOST = 'http://localhost:7777'

beforeAll(() => {
  vi.mock('next/navigation', () => ({
    usePathname: () => useRouter().pathname,
    useRouter: () => useRouter()
  }))

  MockRouter.setCurrentUrl('/')
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  MockRouter.refresh = () => {
    MockRouter.setCurrentUrl(MockRouter.pathname) // Simulates a page refresh
  }
})
