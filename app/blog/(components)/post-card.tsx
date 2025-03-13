import { type Post } from '../(domain)/post'
import React from 'react'

export default function PostCard ({ post }: { post: Post }): React.ReactElement {
  return (
    <article
      className="flex flex-col sm:flex-row items-start gap-4 p-4 border border-gray-700 rounded-lg shadow-md bg-gray-900 hover:shadow-lg transition-all duration-300">
      <img
        src={post.thumbnail}
        alt={post.title}
        className="w-full sm:w-48 h-40 sm:h-40 object-cover rounded-md"
      />
      <div className="flex flex-col flex-grow">
        <h2 className="text-2xl font-bold text-white hover:text-green-400 transition-colors duration-200">
          {post.title}
        </h2>
        <p className="text-lg text-gray-400 line-clamp-2 mt-2">
          {post.content}
        </p>
        <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
          <time>{post.createdAt.toLocaleDateString()}</time>
        </div>
        {/* Tags Section */}
        {/* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {post.tags.map(tag => (
              <span key={tag} className="px-2 py-1 text-xs font-medium text-gray-300 bg-gray-700 rounded">
                #{tag}
              </span>
            ))}
          </div>
        )}
        {/* Likes and Comments Section */}
        <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span>👍 {post.likes}</span>
            <span>💬 {post.comments}</span>
          </div>
        </div>
      </div>
    </article>
  )
}
