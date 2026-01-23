import { type Command } from '../domain/command'

export const cdCommand: Command = {
  name: 'cd',
  description: '섹션을 이동합니다',
  category: 'navigation',
  usage: 'cd [blog|memo|home]',
  execute: async (setContext, args): Promise<void> => {
    const target = args[0]

    if (target === undefined || target === '') {
      setContext((prev) => ({
        ...prev,
        view: [...prev.view, '현재 위치: /home', '사용법: cd [blog|memo|home]']
      }))
      return
    }

    const validTargets = ['blog', 'memo', 'home']
    if (!validTargets.includes(target)) {
      setContext((prev) => ({
        ...prev,
        view: [...prev.view, `오류: '${target}' 경로를 찾을 수 없습니다.`, '사용법: cd [blog|memo|home]']
      }))
      return
    }

    // Navigation will be handled by Next.js router in client component
    const routes: Record<string, string> = {
      blog: '/blog',
      memo: '/memo',
      home: '/'
    }

    setContext((prev) => ({
      ...prev,
      view: [...prev.view, `${target} 섹션으로 이동합니다...`, `위치: ${routes[target]}`],
      processContext: { action: 'navigate', path: routes[target] }
    }))

    // Client will handle window.location.href or router.push based on processContext
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.href = routes[target]
      }
    }, 500)
  }
}
