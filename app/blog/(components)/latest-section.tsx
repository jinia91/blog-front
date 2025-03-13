import React from 'react'
import { type Post } from '../(domain)/post'
import PostCard from './post-card'

export default function LatestSection ({
  title,
  posts
}: {
  title: string
  posts: Post[]
}): React.ReactElement {
  return (
    <div className="relative flex flex-col bg-gray-900 text-gray-300 border-2 animate-glow border-green-400 m-3">
      <header className="px-4 py-4">
        <div className="flex items-center">
          <div className="flex-grow border-t animate-glow border-green-400"></div>
          <h1 className="px-4 text-lg font-bold text-green-400">{title}</h1>
          <div className="flex-grow border-t animate-glow border-green-400"></div>
        </div>
      </header>

      <main className="flex flex-col gap-4 p-4">
        {posts.map((post) => PostCard({ post }))}
      </main>
    </div>
  )
}
