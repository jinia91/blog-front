import React from 'react'
import { getArticleById } from '../(infra)/article'

export default async function ArticlePage ({ params }: { params: { id: string } }): Promise<React.ReactElement> {
  try {
    const article = await getArticleById(Number(params.id))

    if (article == null) {
      return (
        <div className="p-4 text-gray-300 bg-gray-900 border-2 border-red-400 max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-red-400">Article Not Found</h1>
          <p className="mt-2 text-sm text-gray-400">The requested article does not exist or was removed.</p>
        </div>
      )
    }

    return (
      <div className="p-4 text-gray-300 bg-gray-900 border-2 border-green-400 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-green-400">{article.title}</h1>
        <div className="mt-4 text-gray-200 whitespace-pre-line">{article.content}</div>
      </div>
    )
  } catch (error) {
    console.error('Failed to fetch article:', error)

    return (
      <div className="p-4 text-gray-300 bg-gray-900 border-2 border-red-400 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-red-400">Error Loading Article</h1>
        <p className="mt-2 text-sm text-gray-400">There was an issue loading this article. Please try again later.</p>
      </div>
    )
  }
}
