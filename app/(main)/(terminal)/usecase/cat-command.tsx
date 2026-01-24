import { type Command } from '../domain/command'
import { fetchArticleCardsByOffset } from '../../../blog/(infra)/article-card'

export const catCommand: Command = {
  name: 'cat',
  description: '블로그 포스트의 미리보기를 출력합니다',
  category: 'navigation',
  usage: 'cat <article-id> (예: cat #123 또는 cat 123)',
  execute: async (setContext, args): Promise<void> => {
    const rawArticleId = args[0]

    if (rawArticleId === undefined || rawArticleId === '') {
      setContext((prev) => ({
        ...prev,
        view: [...prev.view, '오류: 아티클 ID를 입력해주세요.', '사용법: cat <article-id> (예: cat #123 또는 cat 123)', '💡 ls blog 명령으로 아티클 ID 목록을 확인하세요']
      }))
      return
    }

    // Remove # prefix if present
    const articleId = rawArticleId.startsWith('#') ? rawArticleId.slice(1) : rawArticleId

    setContext((prev) => ({
      ...prev,
      view: [...prev.view, '아티클을 조회중입니다...']
    }))

    try {
      const articles = await fetchArticleCardsByOffset(null, 100, true)
      const article = articles.find(a => a.id.toString() === articleId)

      if (article === null || article === undefined) {
        setContext((prev) => ({
          ...prev,
          view: [...prev.view.slice(0, -1), `오류: 아티클 ID ${articleId}를 찾을 수 없습니다.`]
        }))
        return
      }

      const preview = article.content.length > 500
        ? article.content.substring(0, 500) + '...'
        : article.content

      const lines = [
        '',
        '═══════════════════════════════════════════════════════════',
        `제목: ${article.title}`,
        `작성일: ${article.createdAt.toLocaleDateString('ko-KR')}`,
        `태그: ${article.tags.join(', ') !== '' ? article.tags.join(', ') : '없음'}`,
        '═══════════════════════════════════════════════════════════',
        '',
        preview,
        '',
        `전체 내용을 보려면 /blog/${article.id} 로 이동하세요.`
      ]

      setContext((prev) => ({
        ...prev,
        view: [...prev.view.slice(0, -1), ...lines]
      }))
    } catch (error) {
      setContext((prev) => ({
        ...prev,
        view: [...prev.view.slice(0, -1), '오류: 아티클을 가져올 수 없습니다.']
      }))
    }
  }
}
