import React from 'react'
import PopularSection from './(components)/popular-section'
import LatestSection from './(components)/latest-section'

export default function blog (): React.ReactElement {
  return (
    <main className="flex flex-col min-h-screen bg-gray-900 text-gray-300 border-2 border-green-400">
      <PopularSection title="인기글"/>
      <LatestSection title="최신글" posts={[
        { id: 1, title: '포스트 1', thumbnail: 'https://via.placeholder.com/150', createdAt: new Date() },
        { id: 2, title: '포스트 2', thumbnail: 'https://via.placeholder.com/150', createdAt: new Date() },
        { id: 3, title: '포스트 3', thumbnail: 'https://via.placeholder.com/150', createdAt: new Date() },
        { id: 4, title: '포스트 4', thumbnail: 'https://via.placeholder.com/150', createdAt: new Date() }
      ]}/>
    </main>
  )
}
