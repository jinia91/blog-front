import React from 'react'

interface AsideSectionProps {
  posts: Array<{ tags: string[] }>
  onSelectTag: (tags: string[]) => void
  selectedTags: string[]
}

export default function AsideSection ({ posts, onSelectTag, selectedTags = [] }: AsideSectionProps): React.ReactElement {
  const allTags = Array.from(new Set(posts.flatMap(post => post.tags)))

  const handleTagClick = (tag: string): void => {
    const newSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag]

    onSelectTag(newSelectedTags)
  }

  return (
    <div className="border-1 border-b-green-400 h-full">
      {/* 검색 입력창 */}
      <input
        type="text"
        placeholder="Search"
        className="w-full p-2 bg-gray-900 text-white border border-green-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
      />

      {/* 태그 목록 */}
      <div className="mt-4">
        <h3 className="text-green-400 font-bold mb-2">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => { handleTagClick(tag) }}
              className={`px-3 py-1 rounded-md border font-medium transition-all
                ${
                selectedTags.includes(tag)
                  ? 'bg-green-700 text-white border-green-700' // Selected: Darker green
                  : 'border-green-400 text-green-300'
              }
                hover:bg-green-500 hover:text-white hover:border-green-500`} // Hover: Brighter green
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
