'use client'
import React, { useCallback, useEffect } from 'react'
import { useArticleEditSystem } from '../../(usecase)/article-system-usecases'
import { fetchArticleById } from '../../(infra)/article'
import MDEditor, { bold, comment, hr, italic, table } from '@uiw/react-md-editor'
import { Code } from '../../../memo/(components)/memo-editor/memo-editor-plugins'

export default function ArticleEditorMain ({ pageMemoId }: { pageMemoId: string }): React.ReactElement {
  const {
    setArticleTitle,
    articleContent,
    setArticleContent,
    setArticleTags,
    setThumbnail,
    uploadImage
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

  const handleImageUpload = useCallback(async (event: React.ClipboardEvent<HTMLDivElement>) => {
    const items = event.clipboardData.items
    try {
      for (const item of items) {
        if (item.type.indexOf('image') === 0) {
          const file = item.getAsFile()
          if (file != null) {
            void uploadImage(file)
          }
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error)
    }
  }, [])

  return (<div
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
      previewOptions={{
        components: {
          code: Code
        }
      }}
    />
  </div>)
}
