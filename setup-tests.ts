import { vi } from 'vitest'
import * as mockRouter from 'next-router-mock'
import MockRouter from 'next-router-mock'

const useRouter = mockRouter.useRouter

beforeAll(() => {
  vi.mock('next/navigation', () => ({
    usePathname: () => useRouter().pathname,
    useRouter: () => useRouter()
  }))

  MockRouter.setCurrentUrl('/')
})
