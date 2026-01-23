import { vi } from 'vitest'
import * as mockRouter from 'next-router-mock'
import MockRouter from 'next-router-mock'

const useRouter = mockRouter.useRouter

process.env.NEXT_PUBLIC_HOST = 'http://localhost:7777'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
    get length () { return Object.keys(store).length },
    key: (index: number) => Object.keys(store)[index] ?? null
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
    get length () { return Object.keys(store).length },
    key: (index: number) => Object.keys(store)[index] ?? null
  }
})()

Object.defineProperty(globalThis, 'sessionStorage', { value: sessionStorageMock })

beforeEach(() => {
  localStorageMock.clear()
  sessionStorageMock.clear()
})

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
