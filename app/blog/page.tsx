import React from 'react'
import SwiperCarousel from './(components)/carousel'
import PopularSection from './(components)/blog-layout-box'

export default function blog (): React.ReactElement {
  return (
    <main className="flex flex-col min-h-screen bg-gray-900 text-gray-300 border-2 border-green-400">
      <PopularSection title="인기글">
        <SwiperCarousel/>
      </PopularSection>
    </main>
  )
}
