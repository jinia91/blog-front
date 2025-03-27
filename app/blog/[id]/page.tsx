import React from 'react'
import { fetchArticleById } from '../(infra)/article-card'
import html from 'remark-html'
import { notFound } from 'next/navigation'
import { rehype } from 'rehype'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { remark } from 'remark'
import { TOC } from '../(components)/toc'
import EditButton from '../(components)/edit-button'
import DeleteButton from '../(components)/delete-button'
import { Status } from '../(domain)/article'

export default async function ArticlePage ({ params }: { params: { id: string } }): Promise<React.ReactElement> {
  const article = await fetchArticleById(Number(params.id), Status[Status.PUBLISHED])

  if (article == null) {
    notFound()
  }

  const contentHtml = await remark()
    .use(html)
    .process(article.content)

  const rehypeHtml = await rehype()
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
    .process(contentHtml.toString())

  return (
    <div
      className="relative m-4 p-4 text-gray-300 bg-gray-900 border-2 border-green-400 max-w-full mx-auto h-[80vh] overflow-y-auto scrollbar-thumb-green-400 scrollbar-track-gray-700">
      <div
        className="m-4 p-4 text-gray-300 bg-gray-900 mx-auto max-w-7xl">
        <div className="relative">
          <img src={article.thumbnail} alt={article.title} className="w-full h-96 object-center opacity-40"/>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <h1 className="text-5xl font-bold text-green-400 drop-shadow-lg">{article.title}</h1>
            <p className="text-gray-400 mt-2 text-lg">{new Date(article.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="mt-4 text-center">
          {article.tags.length > 0
            ? (
              <div className="flex flex-wrap justify-center gap-2">
                Tags : {article.tags.map(tag => (
                <span key={tag.name} className="px-3 py-1 bg-green-700 text-gray-100 rounded-full text-sm">
                {tag.name}
              </span>
              ))}
              </div>
              )
            : null}
        </div>

        <div className="border-b border-gray-700 mt-6"/>

        <div
          className="lg:fixed lg:top-52 lg:right-12 bg-gray-700 p-5 rounded-lg shadow-lg border border-gray-700 max-h-screen shadow-gray-600 opacity-75">
          <TOC tocData={article.content}/>
        </div>
        <div className="mt-4 text-gray-200 prose max-w-none dark:prose-invert overflow-y-auto"
             dangerouslySetInnerHTML={{ __html: rehypeHtml.toString() }}/>

        <div className="border-b border-gray-700 mt-6 mb-6"/>

        <div className="flex justify-end mt-4">
          <EditButton articleId={article.id.toString()}/>
          <DeleteButton articleId={article.id.toString()}/>
        </div>

        <div className="border-b border-gray-700 mt-6 mb-6"/>

      </div>
    </div>
  )
}
