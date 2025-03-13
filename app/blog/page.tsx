'use client'
import React, { useState } from 'react'
import LatestSection from './(components)/latest-section'
import AsideSection from './(components)/aside-section'

const posts = [
  {
    id: 1,
    title: '포스트 1',
    content: '포스트 1 내용',
    thumbnail: 'https://next-blog-starter.vercel.app/_next/image?url=%2Fassets%2Fblog%2Fhello-world%2Fcover.jpg&w=3840&q=75',
    createdAt: new Date(),
    tags: ['React', 'TypeScript'],
    likes: 10,
    comments: 5
  },
  {
    id: 2,
    title: '포스트 2',
    content: '포스트 2 내용',
    thumbnail: 'https://next-blog-starter.vercel.app/_next/image?url=%2Fassets%2Fblog%2Fhello-world%2Fcover.jpg&w=3840&q=75',
    createdAt: new Date(),
    tags: ['React'],
    likes: 10,
    comments: 5
  },
  {
    id: 3,
    title: '포스트 3',
    content: '포스트 3 내용',
    thumbnail: 'https://next-blog-starter.vercel.app/_next/image?url=%2Fassets%2Fblog%2Fhello-world%2Fcover.jpg&w=3840&q=75',
    createdAt: new Date(),
    tags: ['TypeScript'],
    likes: 10,
    comments: 5
  },
  {
    id: 4,
    title: '포스트 4',
    content: '포스트 4 내용',
    thumbnail: 'https://next-blog-starter.vercel.app/_next/image?url=%2Fassets%2Fblog%2Fhello-world%2Fcover.jpg&w=3840&q=75',
    createdAt: new Date(),
    tags: ['Next.js'],
    likes: 10,
    comments: 5
  },
  {
    id: 5,
    title: '포스트 5',
    content: '포스트 5 내용',
    thumbnail: 'https://next-blog-starter.vercel.app/_next/image?url=%2Fassets%2Fblog%2Fhello-world%2Fcover.jpg&w=3840&q=75',
    createdAt: new Date(),
    tags: ['Next.js'],
    likes: 10,
    comments: 5
  }
]

export default function Blog (): React.ReactElement {
  const [selectedTag, setSelectedTag] = useState<string[]>([])
  const filteredPosts = posts.filter(post => {
    if (selectedTag.length === 0) return true
    return post.tags.some(tag => selectedTag.includes(tag))
  })
  return (
    <main className="flex bg-gray-900 text-gray-300 border-2 border-green-400"
          style={{ maxHeight: 'calc(100vh - 180px)' }}>
      <div className="flex-grow overflow-y-auto">
        <LatestSection title={(selectedTag.length > 0)
          ? `#${selectedTag.join(' #')}`
          : 'Latest Posts'} posts={filteredPosts}/>
      </div>
      <aside className="hidden sm:block sm:w-64 p-4 border-l border-green-400 bg-gray-800">
        <AsideSection posts={posts} onSelectTag={setSelectedTag} selectedTags={selectedTag}/>
      </aside>
    </main>
  )
}
