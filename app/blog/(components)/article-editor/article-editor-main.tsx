'use client'
import React, { useCallback, useEffect } from 'react'
import { Status, useArticleEditSystem } from '../../(usecase)/article-system-usecases'
import { fetchDraftArticleById, publishArticle, unpublishArticle } from '../../(infra)/article'
import MDEditor, { bold, comment, hr, italic, table } from '@uiw/react-md-editor'
import useArticleStompClient from './article-stomp-client'
import DeleteButton from '../delete-button'
import { useTabBarAndRouter } from '../../../(layout)/(usecase)/tab-usecases'
import { ApplicationType, type Tab } from '../../../(layout)/(domain)/tab'

export default function ArticleEditorMain ({ articleId }: { articleId: string }): React.ReactElement {
  const {
    articleTitle,
    setArticleTitle,
    articleContent,
    setArticleContent,
    setArticleTags,
    thumbnail,
    setThumbnail,
    uploadThumbnail,
    uploadImageOnContents,
    status,
    setStatus
  } = useArticleEditSystem()
  const { selectedTabIdx, tabs, closeAndNewTab } = useTabBarAndRouter()

  useEffect(() => {
    async function load (): Promise<void> {
      const article = await fetchDraftArticleById(Number(articleId))
      if (article != null) {
        setArticleTitle(article.title)
        setArticleContent(article.content)
        setArticleTags(article.tags)
        setThumbnail(article.thumbnail)
        article.isPublished ? setStatus(Status.PUBLISH) : setStatus(Status.DRAFT)
      }
    }

    void load()
  }, [articleId])

  useArticleStompClient(articleId, articleTitle, articleContent, thumbnail)

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
  }, [articleContent])

  const handleThumbnailUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file != null) {
      void uploadThumbnail(file)
    }
  }, [thumbnail])

  const handlePublishClick = useCallback(() => {
    void publishArticle(articleId)
    setStatus(Status.PUBLISH)
    const tab: Tab = { name: articleTitle, urlPath: `/blog/${articleId}`, type: ApplicationType.COMMON }
    closeAndNewTab(selectedTabIdx, tab)
  }, [tabs])

  const handleUnPublishClick = useCallback(() => {
    void unpublishArticle(articleId)
    setStatus(Status.DRAFT)
    closeAndNewTab(selectedTabIdx, { name: 'blog', urlPath: '/blog' })
  }, [tabs])

  return (
    <div className="flex-grow overflow-y-scroll border-2 p-4 max-w-7xl mx-auto">

      {(
        <div className="relative">
          <img
            src={(thumbnail === '' ? 'https://upload.wikimedia.org/wikipedia/commons/a/a6/No_picture_available_png.png' : thumbnail)}
            alt="Thumbnail Preview" className="w-full h-96 object-center opacity-40"/>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <h1 className="">{}</h1>
            <input
              type="text"
              value={articleTitle}
              onChange={(e) => {
                setArticleTitle(e.target.value)
              }}
              placeholder="아티클 제목"
              className="text-5xl font-bold text-green-400 drop-shadow-lg text-center"
            />
          </div>
        </div>
      )}
      <div className="mt-4 mb-4 flex items-center space-x-4 flex-grow w-full">
        <label htmlFor="file-upload"
               className="px-4 py-2 font-mono text-sm bg-gray-800 text-green-400 border border-green-400 rounded shadow-lg transition-all hover:bg-green-600 hover:text-gray-200">
          📂 썸네일 파일 선택
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={handleThumbnailUpload}
          className="hidden"
        />
        <input
          type="text"
          value={thumbnail}
          onChange={(e) => {
            setThumbnail(e.target.value)
          }}
          placeholder="썸네일 URL 입력"
          className="flex p-2 border border-green-500 bg-black text-green-400 placeholder-green-500 rounded w-5/6 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
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
      <div className="flex justify-between items-center mt-4 w-full">
        <div className="flex space-x-4">
          <button
            onClick={() => {
              handlePublishClick()
            }}
            className="px-4 py-2 font-mono text-sm bg-gray-800 text-green-400 border border-green-400 rounded shadow-lg transition-all hover:bg-green-700 hover:text-gray-100 hover:shadow-green-400"
          > PUBLISH
          </button>
          <DeleteButton articleId={articleId}/>
        </div>

        <div className="relative flex items-center">
          <span className="text-green-400 font-mono mr-3">{status === Status.DRAFT ? 'DRAFT' : 'PUBLISH'}</span>
          <div
            onClick={() => {
              if (status === Status.PUBLISH) {
                if (window.confirm('게시글을 미게시 상태로 변경하시겠습니까?')) {
                  handleUnPublishClick()
                }
              }
            }}
            className={`relative w-16 h-8 rounded-full transition duration-300 border border-green-500 cursor-pointer
              ${status === Status.PUBLISH ? 'bg-green-600 shadow-[0_0_15px_#33ff33]' : 'bg-gray-700 cursor-not-allowed'}`}
          >
            <div
              className={`absolute top-1 left-1 w-6 h-6 rounded-full transition-transform duration-300 shadow-md ${
                status === Status.PUBLISH ? 'translate-x-8 bg-green-500 shadow-[0_0_10px_#33ff33]' : 'translate-x-0 bg-gray-400'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
