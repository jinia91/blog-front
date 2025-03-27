import React, { useState } from 'react'
import { type Tag } from '../../(domain)/tag'
import { useArticleEditSystem } from '../../(usecase)/article-system-usecases'

export const TagManager = (): React.ReactElement => {
  const [inputValue, setInputValue] = useState('')
  const { tags, addTag, removeTag } = useArticleEditSystem()

  const addTagCallBack = async (): Promise<void> => {
    try {
      const newTagInput = inputValue.trim()
      await addTag(newTagInput)
      setInputValue('')
    } catch (error) {
      console.error('태그 추가를 실패했습니다')
    }
  }

  const removeTagCallBack = async (removeTarget: Tag): Promise<void> => {
    try {
      await removeTag(removeTarget)
    } catch (error) {
      console.error('태그 삭제를 실패했습니다')
    }
  }

  return (
    <div className="flex flex-col space-y-2 mb-4 p-3 bg-gray-800 border border-gray-700 rounded">
      <div className="flex items-center flex-wrap gap-2">
        <span className="text-sm text-green-400 font-semibold mr-2">Tags:</span>
        {tags.map((tag) => (
          <span
            key={tag.id}
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
    </div>
  )
}
