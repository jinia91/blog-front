import { type Command } from '../domain/command'
import { fetchArticleCardsByOffset } from '../../../blog/(infra)/article-card'
import { fetchFolderAndMemo } from '../../../memo/(infra)/memo'

export const lsCommand: Command = {
  name: 'ls',
  description: '블로그 포스트 또는 메모 목록을 조회합니다',
  category: 'navigation',
  usage: 'ls [blog|memo|all]',
  execute: async (setContext, args): Promise<void> => {
    const target = args[0] ?? 'all'

    setContext((prev) => ({
      ...prev,
      view: [...prev.view, '목록을 조회중입니다...']
    }))

    try {
      const lines: string[] = []

      if (target === 'blog' || target === 'all') {
        const articles = await fetchArticleCardsByOffset(null, 10, true)
        if (articles.length > 0) {
          lines.push('\n[Blog Posts]')
          articles.forEach((article, index) => {
            const date = article.createdAt.toLocaleDateString('ko-KR')
            lines.push(`  ${index + 1}. ${article.title} (${date})`)
          })
        } else {
          lines.push('\n[Blog Posts]')
          lines.push('  게시글이 없습니다.')
        }
      }

      if (target === 'memo' || target === 'all') {
        const folders = await fetchFolderAndMemo()
        if (folders !== null && folders !== undefined && folders.length > 0) {
          lines.push('\n[Memos]')
          folders.forEach((folder) => {
            lines.push(`  📁 ${folder.name}`)
            folder.memos.forEach((memo) => {
              lines.push(`    - ${memo.title !== '' && memo.title !== undefined && memo.title !== null ? memo.title : 'Untitled'}`)
            })
          })
        } else {
          lines.push('\n[Memos]')
          lines.push('  메모가 없습니다.')
        }
      }

      if (target !== 'blog' && target !== 'memo' && target !== 'all') {
        lines.push(`오류: 알 수 없는 대상 '${target}'`)
        lines.push('사용법: ls [blog|memo|all]')
      }

      setContext((prev) => ({
        ...prev,
        view: [...prev.view.slice(0, -1), ...lines]
      }))
    } catch (error) {
      setContext((prev) => ({
        ...prev,
        view: [...prev.view.slice(0, -1), '오류: 목록을 가져올 수 없습니다.']
      }))
    }
  }
}
