import React from 'react'
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
    id: 1,
    title: '포스트 1',
    content: '포스트 1 내용',
    thumbnail: 'https://next-blog-starter.vercel.app/_next/image?url=%2Fassets%2Fblog%2Fhello-world%2Fcover.jpg&w=3840&q=75',
    createdAt: new Date(),
    tags: ['React', 'TypeScript'],
    likes: 10,
    comments: 5
  }
]

export default function blog (): React.ReactElement {
  return (
    <main className="flex bg-gray-900 text-gray-300 border-2 border-green-400"
          style={{ maxHeight: 'calc(100vh - 180px)' }}>
      <div className="flex-grow overflow-y-auto">
        <LatestSection title="Articles" posts={posts}/>
      </div>
      <aside className="w-64 p-4 border-l border-green-400 bg-gray-800">
        <AsideSection/>
      </aside>
    </main>
  )
}
