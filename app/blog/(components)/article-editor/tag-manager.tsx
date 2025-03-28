import React, { useEffect, useRef, useState } from 'react'
import { type Tag } from '../../(domain)/tag'
import { useArticleEditSystem } from '../../(usecase)/article-system-usecases'

export const TagManager = ({ articleId }: { articleId: number }): React.ReactElement => {
  const [inputValue, setInputValue] = useState('')
  const [suggestedTags, setSuggestedTags] = useState<Tag[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { tags, addTag, removeTag } = useArticleEditSystem()

  useEffect(() => {
    const fetchTags = async () => {
      const dummyTags: Tag[] = Array.from({ length: 20 }, (_, i) => ({ id: i, name: `tag${i}` }))
      setSuggestedTags(dummyTags)
    }

    fetchTags().catch(console.error)
  }, [])

  const addTagCallBack = async (): Promise<void> => {
    const newTagInput = inputValue.trim()
    await addTag(articleId, newTagInput)
    setInputValue('')
  }

  const removeTagCallBack = async (removeTarget: Tag): Promise<void> => {
    await removeTag(articleId, removeTarget)
  }

  return (
    <div className="flex flex-col space-y-2 mb-4 p-3 bg-gray-800 border border-gray-700 rounded">
      <div className="flex items-center flex-wrap gap-2">
        <span className="text-sm text-green-400 font-semibold mr-2">Tags:</span>
        {Array.isArray(tags) && tags.length !== 0 && tags.map(tag => (
          <span
            key={tag.name}
            className="bg-green-600 text-white px-2 py-1 text-xs rounded flex items-center space-x-1"
          >
            <span>{tag.name}</span>
            <button
              onClick={() => {
                void removeTagCallBack(tag)
              }}
              className="ml-1 text-gray-300 hover:text-red-400"
            >
              X
            </button>
          </span>
        ))}
      </div>
      <div className="flex space-x-2 mt-2 relative">
        <input
          type="text"
          className="text-sm px-2 py-1 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="Add new tag"
          value={inputValue}
          ref={inputRef}
          onFocus={() => {
            setShowSuggestions(true)
          }}
          onBlur={() => setTimeout(() => {
            setShowSuggestions(false)
          }, 100)} // delay to allow click
          onChange={(e) => {
            setInputValue(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              void addTagCallBack()
            }
          }}
        />
        <button
          onClick={() => {
            void addTagCallBack()
          }}
          className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-gray-200 border border-gray-600"
        >
          + Add Tag
        </button>
      </div>
      {showSuggestions && (inputValue !== '') && (
        <div className="absolute mt-8 bg-gray-800 border border-gray-600 rounded shadow-md z-10 max-h-48 overflow-auto">
          {suggestedTags
            .filter(tag => tag.name.includes(inputValue) && !tags.some(t => t.name === tag.name))
            .map(tag => (
              <div
                key={tag.name}
                onClick={() => {
                  void addTag(articleId, tag.name)
                  setInputValue('')
                  setShowSuggestions(false)
                }}
                className="px-3 py-1 text-sm text-white hover:bg-green-600 cursor-pointer"
              >
                {tag.name}
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
