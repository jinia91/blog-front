import React from 'react'
import { fetchArticleById } from '../(infra)/article'
import html from 'remark-html'
import { notFound } from 'next/navigation'
import { rehype } from 'rehype'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { remark } from 'remark'
import { TOC } from '../(components)/toc'

export default async function ArticlePage ({ params }: { params: { id: string } }): Promise<React.ReactElement> {
  const article = await fetchArticleById(Number(params.id))

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
      className="relative m-4 p-4 text-gray-300 bg-gray-900 border-2 border-green-400 max-w-7xl mx-auto h-[80vh] overflow-y-auto scrollbar-thumb-green-400 scrollbar-track-gray-700">

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
        className="lg:fixed lg:top-52 lg:right-12 bg-gray-800 p-5 rounded-lg shadow-lg border border-gray-700 hover:shadow-xl max-h-screen shadow-gray-600 opacity-75">
        <TOC tocData={article.content}/>
      </div>
      <div className="mt-4 text-gray-200 prose max-w-none dark:prose-invert overflow-y-auto"
           dangerouslySetInnerHTML={{ __html: rehypeHtml.toString() }}/>
    </div>
  )
}
