import React from 'react'

interface Post {
  id: number
  title: string
  thumbnail: string
}

export default function LatestSection ({
  title,
  posts
}: {
  title: string
  posts: Post[]
}): React.ReactElement {
  return (
    <div className="relative flex flex-col bg-gray-900 text-gray-300 border-2 border-green-400 m-3">
      <header className="px-4 py-4">
        <div className="flex items-center">
          <div className="flex-grow border-t border-green-400"></div>
          <h1 className="px-4 text-lg font-bold text-green-400">{title}</h1>
          <div className="flex-grow border-t border-green-400"></div>
        </div>
      </header>

      <main className="flex flex-col gap-4 p-4">
        {posts.map((post) => (
          <div key={post.id} className="flex items-center gap-4">
            <img
              src={post.thumbnail}
              alt={post.title}
              className="w-24 h-24 object-cover border border-green-400"
            />
            <div className="flex-grow">
              <h2 className="text-md font-semibold text-white">{post.title}</h2>
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}
