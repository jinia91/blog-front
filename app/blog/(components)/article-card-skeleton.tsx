import React from 'react'

export default function ArticleCardSkeleton (): React.ReactElement {
  return (
    <article
      className="flex flex-col sm:flex-row items-start gap-4 p-4 border border-gray-700 rounded-lg shadow-md bg-gray-900 animate-pulse">
      {/* Thumbnail skeleton */}
      <div className="relative flex-shrink-0 w-full sm:w-48 h-40 bg-gray-700 rounded-md"/>

      {/* Content skeleton */}
      <div className="flex flex-col flex-grow w-full">
        {/* Title skeleton */}
        <div className="h-8 bg-gray-700 rounded w-3/4 mb-2"/>

        {/* Content preview skeleton (2 lines) */}
        <div className="space-y-2 mt-2">
          <div className="h-6 bg-gray-700 rounded w-full"/>
          <div className="h-6 bg-gray-700 rounded w-5/6"/>
        </div>

        {/* Date skeleton */}
        <div className="flex items-center justify-between mt-4">
          <div className="h-4 bg-gray-700 rounded w-24"/>
        </div>

        {/* Tags skeleton */}
        <div className="flex flex-wrap gap-2 mt-2">
          <div className="h-6 bg-gray-700 rounded w-16"/>
          <div className="h-6 bg-gray-700 rounded w-20"/>
          <div className="h-6 bg-gray-700 rounded w-14"/>
        </div>

        {/* Bottom placeholder for spacing */}
        <div className="mt-4"/>
      </div>
    </article>
  )
}
