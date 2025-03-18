'use client'
import React, { useCallback, useEffect } from 'react'
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

  useEffect(() => {
    async function load (): Promise<void> {
      const article = await fetchArticleById(Number(pageMemoId))
      if (article != null) {
        setArticleTitle(article.title)
        setArticleContent(article.content)
        setArticleTags(article.tags)
        setThumbnail(article.thumbnail)
      }
    }

    void load()
  }, [pageMemoId])
  useArticleStompClient(pageMemoId, articleTitle, articleContent, thumbnail)

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
    <>
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
        placeholder="Enter article title"
        className="w-full p-2 border rounded mb-4"
      />

      <div
        onPaste={(e) => {
          handleImageUpload(e).catch(console.error)
        }}
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
    </>
  )
}
