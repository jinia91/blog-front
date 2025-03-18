'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { useArticleEditSystem } from '../../(usecase)/article-system-usecases'
import { fetchArticleById } from '../../(infra)/article'
import MDEditor, { bold, comment, hr, italic, table } from '@uiw/react-md-editor'
import useArticleStompClient from './article-stomp-client'

export default function ArticleEditorMain ({ pageMemoId }: { pageMemoId: string }): React.ReactElement {
  const {
    articleTitle,
    setArticleTitle,
    articleContent,
    setArticleContent,
    setArticleTags,
    thumbnail,
    setThumbnail,
    uploadThumbnail,
    uploadImageOnContents
  } = useArticleEditSystem()

  const [isPublished, setIsPublished] = useState(false)

  useEffect(() => {
    async function load (): Promise<void> {
      const article = await fetchArticleById(Number(pageMemoId))
      if (article != null) {
        setArticleTitle(article.title)
        setArticleContent(article.content)
        setArticleTags(article.tags)
        setThumbnail(article.thumbnail)
        setIsPublished(article.isPublished || false)
      }
    }

    void load()
  }, [pageMemoId])

  useArticleStompClient(pageMemoId, articleTitle, articleContent, thumbnail)

  const handleTogglePublish = () => {
    setIsPublished(prev => !prev)
  }

  const handleImageUpload = useCallback(async (event: React.ClipboardEvent<HTMLDivElement>) => {
    const items = event.clipboardData.items
    try {
      for (const item of items) {
        if (item.type.indexOf('image') === 0) {
          const file = item.getAsFile()
          if (file != null) {
            void uploadImageOnContents(file)
          }
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error)
    }
  }, [])

  const handleThumbnailUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file != null) {
      void uploadThumbnail(file)
    }
  }, [])

  return (
    <div className="flex-grow overflow-y-scroll border-2 p-4">
      {(thumbnail !== '') && (
        <div className="mb-4">
          <img src={thumbnail} alt="Thumbnail Preview" className="w-80 h-80 object-cover border rounded"/>
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleThumbnailUpload}
        className="mb-4"
      />

      <input
        type="text"
        value={articleTitle}
        onChange={(e) => {
          setArticleTitle(e.target.value)
        }}
        placeholder="아티클 제목"
        className="w-full p-2 border rounded mb-4"
      />

      <div
        onPaste={(e) => {
          handleImageUpload(e).catch(console.error)
        }}
        className={'flex-grow'}
      >
        <MDEditor
          value={articleContent}
          commands={[bold, italic, hr, table, comment]}
          onChange={(newValue = '') => {
            setArticleContent(newValue)
          }}
          visibleDragbar={true}
          height="65vh"
          className={'border-2 flex-grow'}
        />
      </div>
      <div className="flex items-center mb-4">
        <div
          onClick={handleTogglePublish}
          className={`relative w-12 h-6 bg-gray-600 rounded-full cursor-pointer transition duration-300 ${
            isPublished ? 'bg-green-600' : 'bg-gray-600'
          }`}
        >
          <div
            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
              isPublished ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </div>
        <span className="text-white font-mono mr-2">{isPublished ? 'PUBLISHED' : 'DRAFT'}</span>
      </div>

    </div>
  )
}
