import React from 'react'
import SwiperCarousel from './carousel'

export default function PopularSection ({ title }: { title: string }): React.ReactElement {
  return (
    <div className="relative flex flex-col bg-gray-900 text-gray-300 border-2 border-green-400 m-3">
      <div
        className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-gray-900 to-transparent pointer-events-none"></div>
      <div
        className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-gray-900 to-transparent pointer-events-none"></div>

      <header className="px-4 py-4">
        <div className="flex items-center">
          <div className="flex-grow border-t border-green-400"></div>
          <h1 className="px-4 text-lg font-bold text-green-400">{title}</h1>
          <div className="flex-grow border-t border-green-400"></div>
        </div>
        <div className="text-right mt-2">
        </div>
      </header>
      <main className="relative flex-grow p-4">
        <SwiperCarousel/>
      </main>
    </div>
  )
}
