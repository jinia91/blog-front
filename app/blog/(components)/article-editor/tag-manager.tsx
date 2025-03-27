import React, { useEffect, useState } from 'react'
import { type Tag } from '../../(domain)/tag'

interface TagManagerProps {
  initialTags: Tag[]
  addTag: (tag: Tag) => void
  removeTag: (tag: Tag) => void
}

export const TagManager: React.FC<TagManagerProps> = ({ initialTags, addTag, removeTag }): React.ReactElement => {
  const [tags, setTags] = useState<Tag[]>(initialTags)
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    setTags(initialTags)
  }, [initialTags])

  const addTag = async (): Promise<void> => {
    if (inputValue.trim() === '' || tags.includes(inputValue.trim())) return
    const newTag = inputValue.trim()
    await addTagApi(newTag)
    const updatedTags = [...tags, newTag]
    setTags(updatedTags)
    onTagsChange(updatedTags)
    setInputValue('')
  }

  const removeTag = async (tagToRemove: string): Promise<void> => {
    await removeTagApi(tagToRemove)
    const updatedTags = tags.filter(tag => tag !== tagToRemove)
    setTags(updatedTags)
    onTagsChange(updatedTags)
  }

  const addTagApi = async (tag: string) => {
    console.log(`Calling API to add tag: ${tag}`)
  }

  const removeTagApi = async (tag: string) => {
    console.log(`Calling API to remove tag: ${tag}`)
  }

  return (
    <div className="flex flex-col space-y-2 mb-4 p-3 bg-gray-800 border border-gray-700 rounded">
      <div className="flex items-center flex-wrap gap-2">
        <span className="text-sm text-green-400 font-semibold mr-2">Tags:</span>
        {tags.map((tag) => (
          <span
            key={tag}
            className="bg-green-600 text-white px-2 py-1 text-xs rounded flex items-center space-x-1"
          >
            <span>{tag}</span>
            <button
              onClick={async () => {
                await removeTag(tag)
              }}
              className="ml-1 text-gray-300 hover:text-red-400"
            >
              X
            </button>
          </span>
        ))}
      </div>
      <div className="flex space-x-2 mt-2">
        <input
          type="text"
          className="text-sm px-2 py-1 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="Add new tag"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addTag()
            }
          }}
        />
        <button
          onClick={addTag}
          className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-gray-200 border border-gray-600"
        >
          + Add Tag
        </button>
      </div>
    </div>
  )
}
