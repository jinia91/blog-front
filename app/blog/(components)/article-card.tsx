import React from 'react'
import Image from 'next/image'
import TabOpen from '../../(layout)/(components)/(tap-system)/tab-open'
import { type ArticleCardViewModel } from '../(domain)/article-card-view-model'

export default function ArticleCard ({ article, isDraft }: {
  article: ArticleCardViewModel
  isDraft: boolean
}): React.ReactElement {
  return (
    <TabOpen name={(article.title === '' && isDraft) ? 'New Article' : article.title}
             href={isDraft ? `/blog/edit/${article.id}` : `/blog/${article.id}`}
    >
      <article
        className="flex flex-col sm:flex-row items-start gap-4 p-4 border border-gray-700 rounded-lg shadow-md bg-gray-900 hover:shadow-lg hover:border-green-400 hover:scale-y-105 transition-all duration-300">
        <div className="relative flex-shrink-0 w-full sm:w-48 h-40">
          {article.thumbnail?.startsWith('http')
            ? (
              <Image
                src={article.thumbnail}
                alt={article.title}
                width={192}
                height={160}
                className="object-cover rounded-md"
                style={{ width: '100%', height: '100%' }}
              />
              )
            : (
              <div className="w-full sm:w-48 h-40 bg-gray-700 rounded-md"/>
              )}
        </div>
        <div className="flex flex-col flex-grow">
          <h2 className="text-2xl font-bold text-white hover:text-green-400 transition-colors duration-200">
            {article.title}
          </h2>
          <p className="text-lg text-gray-400 line-clamp-2 mt-2">
            {article.content}
          </p>
          <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
            <time>{article.createdAt.toLocaleDateString()}</time>
          </div>
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {article.tags.map(tag => (
                <span key={tag.name} className="px-2 py-1 text-xs font-medium text-gray-300 bg-gray-700 rounded">
                #{tag.name}
              </span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              {/* <span>❤ {article.likes}</span> */}
              {/* <span>💬 {article.comments}</span> */}
            </div>
          </div>
        </div>
      </article>
    </TabOpen>
  )
}
