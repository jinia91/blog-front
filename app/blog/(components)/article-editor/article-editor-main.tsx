'use client'
import React, { useEffect, useState } from 'react'
import { useArticleEditSystem } from '../../(usecase)/article-system-usecases'
import MDEditor, { bold, comment, hr, italic, table } from '@uiw/react-md-editor'
import useArticleStompClient from './article-stomp-client'
import DeleteButton from '../delete-button'
import { useTabBarAndRouter } from '../../../(layout)/(usecase)/tab-usecases'
import { ApplicationType } from '../../../(layout)/(domain)/tab'
import { Status } from '../../(domain)/article'
import { TOC } from '../toc'
import CommonModal from '../../../(layout)/(components)/(common)/common-modal'
import { changeStatusArticle, fetchArticleById } from '../../(infra)/article'
import { TagManager } from './tag-manager'
import { ThumbnailInput } from './article-thumnail-manager'

export default function ArticleEditorMain ({ articleId }: { articleId: string }): React.ReactElement {
  const [isTOCVisible, setIsTOCVisible] = useState(true)
  const {
    articleTitle,
    setArticleTitle,
    articleContent,
    setArticleContent,
    thumbnail,
    setThumbnail,
    uploadThumbnail,
    uploadImageOnContents,
    status,
    setStatus,
    tags,
    setTags,
    addTag,
    removeTag
  } = useArticleEditSystem()
  const { selectedTabIdx, closeAndNewTab } = useTabBarAndRouter()

  useEffect(() => {
    async function load (): Promise<void> {
      const article = await fetchArticleById(Number(articleId), Status[Status.DRAFT])
      if (article != null) {
        setArticleTitle(article.title)
        setArticleContent(article.content)
        setTags(article.tags)
        setThumbnail(article.thumbnail)
        article.isPublished ? setStatus(Status.PUBLISHED) : setStatus(Status.DRAFT)
      }
    }

    void load()
  }, [articleId])

  useArticleStompClient(articleId, articleTitle, articleContent, thumbnail)

  function onUnPublish (): void {
    if (status === Status.PUBLISHED) {
      if (window.confirm('게시글을 미게시 상태로 변경하시겠습니까?')) {
        void changeStatusArticle(articleId, Status[Status.PUBLISHED], Status[Status.DRAFT])
        setStatus(Status.DRAFT)
        closeAndNewTab(selectedTabIdx, { name: 'blog', urlPath: '/blog', type: ApplicationType.COMMON })
      }
    }
  }

  function onPublish (): void {
    if (!confirm('게시글을 게시하겠습니까?')) {
      return
    }
    void changeStatusArticle(articleId, Status[status], Status[Status.PUBLISHED])
    setStatus(Status.PUBLISHED)
    closeAndNewTab(selectedTabIdx, {
      name: articleTitle,
      urlPath: `/blog/${articleId}`,
      type: ApplicationType.COMMON
    })
  }

  return (
    <div className="flex-grow overflow-y-scroll border-2 p-4 max-w-7xl mx-auto">
      {isTOCVisible && (
        <CommonModal onClose={() => {
          setIsTOCVisible(false)
        }} className={'opacity-75 fixed top-30 right-6 bg-gray-900 text-green-400 p-4 rounded-lg shadow-lg w-100 z-50'}
        >
          <TOC tocData={articleContent}/>
        </CommonModal>
      )}
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
      <ThumbnailInput thumbnail={thumbnail} setThumbnail={setThumbnail} uploadThumbnail={uploadThumbnail}/>
      <div
        onPaste={(event) => {
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

      <div className={'mt-4 mb-4'}>
        <TagManager initialTags={tags} addTag={addTag} removeTag={removeTag}/>
      </div>

      <div className="flex justify-between items-center mt-4 w-full">
        <div className="flex space-x-4">
          <button
            onClick={() => {
              onPublish()
            }}
            className="px-4 py-2 font-mono text-sm bg-gray-800 text-green-400 border border-green-400 rounded shadow-lg transition-all hover:bg-green-700 hover:text-gray-100 hover:shadow-green-400"
          > PUBLISH
          </button>
          <DeleteButton articleId={articleId}/>
          <button
            onClick={() => {
              setIsTOCVisible(!isTOCVisible)
            }}
            className="px-4 py-2 font-mono text-sm bg-gray-800 text-green-400 border border-green-400 rounded shadow-lg transition-all hover:bg-green-700 hover:text-gray-100 hover:shadow-green-400"
          >
            TOC
          </button>
        </div>
        <div className="relative flex items-center">
          <span className="text-green-400 font-mono mr-3">{status === Status.DRAFT ? 'DRAFT' : 'PUBLISHED'}</span>
          <div
            onClick={() => {
              onUnPublish()
            }}
            className={`relative w-16 h-8 rounded-full transition duration-300 border border-green-500 cursor-pointer
              ${status === Status.PUBLISHED ? 'bg-green-600 shadow-[0_0_15px_#33ff33]' : 'bg-gray-700 cursor-not-allowed'}`}
          >
            <div
              className={`absolute top-1 left-1 w-6 h-6 rounded-full transition-transform duration-300 shadow-md ${
                status === Status.PUBLISHED ? 'translate-x-8 bg-green-500 shadow-[0_0_10px_#33ff33]' : 'translate-x-0 bg-gray-400'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
