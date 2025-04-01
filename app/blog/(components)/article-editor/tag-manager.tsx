import React, { useEffect, useState } from 'react'
import { type Tag } from '../../(domain)/tag'
import { useArticleEditSystem } from '../../(usecase)/article-system-usecases'
import { fetchTopNTags } from '../../(infra)/tag'

export const TagManager = ({ articleId }: { articleId: number }): React.ReactElement => {
  const [inputValue, setInputValue] = useState('')
  const [suggestedTags, setSuggestedTags] = useState<Tag[]>([])
  const { tags, addTag, removeTag } = useArticleEditSystem()

  useEffect(() => {
    const fetchTags = async (): Promise<void> => {
      const tags = await fetchTopNTags(10)
      setSuggestedTags(tags)
    }

    fetchTags().catch(console.debug)
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
          list="tag-suggestions"
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
      <datalist id="tag-suggestions">
        {suggestedTags
          .filter(tag => !tags.some(t => t.name === tag.name))
          .map(tag => (
            <option key={tag.name} value={tag.name}/>
          ))}
      </datalist>
    </div>
  )
}
