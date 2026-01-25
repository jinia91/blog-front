'use client'

import React, { useCallback, useEffect, useState } from 'react'
import MDEditor, {
  bold,
  codeEdit,
  codeLive,
  codePreview,
  comment,
  divider,
  fullscreen,
  hr,
  type ICommand,
  italic,
  table
} from '@uiw/react-md-editor'
import { type Memo, type ReferenceInfo } from '../../(domain)/memo'
import { RelatedMemoModal } from './related-memo-modal'
import { fetchMemoById, uploadImageToServer } from '../../(infra)/memo'
import { MemoTitleInput } from './memo-title-edit-input'
import useMemoStompClient from './memo-edit-websocket'
import { useMemoSystem } from '../../(usecase)/memo-system-usecases'
import { Code, timestamp } from './memo-editor-plugins'
import { createReferenceLinkCommand } from './memo-reference-link'
import { ConnectionStatusIndicator } from '../connection-status-indicator'
import { MemoBreadcrumb } from './memo-breadcrumb'

export default function MemoEditorMain ({ pageMemoId }: { pageMemoId: string }): React.ReactElement {
  const { memoEditorSharedContext, setMemoEditorSharedContext } = useMemoSystem()
  const [memo, setMemo] = useState<Memo | null>(null)
  const [content, setContent] = useState<string>(memo?.content ?? '')
  const [recommendations, setRecommendations] = useState<Memo[]>([])
  const [references, setReferences] = useState<ReferenceInfo[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [resolveSelection, setResolveSelection] = useState<(value: any) => null>()
  useMemoStompClient(pageMemoId, memoEditorSharedContext.title, content, references, setReferences)

  useEffect(() => {
    async function load (): Promise<void> {
      try {
        const fetchedMemo = await fetchMemoById(pageMemoId)
        if (fetchedMemo != null) {
          setMemo(fetchedMemo)
          setMemoEditorSharedContext({ id: fetchedMemo.memoId.toString(), title: fetchedMemo.title })
          setContent(fetchedMemo.content)
          setReferences(fetchedMemo.references)
        }
      } catch (error) {
        console.debug('Error fetching data:', error)
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
            const data = await uploadImageToServer(file)
            if (data === null) {
              throw new Error('이미지 업로드 통신 실패')
            }
            const imageUrl = data.url
            const markdownImageLink = `![uploaded image](${imageUrl})\n`
            setContent(prevContent => prevContent + markdownImageLink)
          }
        }
      }
    } catch (error) {
      console.debug('Error uploading image:', error)
    }
  }, [])

  const openModalWithSelection = async (): Promise<unknown> => {
    setIsModalOpen(true)
    return await new Promise((resolve) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      setResolveSelection(() => resolve)
    })
  }
  const referenceLink = createReferenceLinkCommand({ pageMemoId, setRecommendations, openModalWithSelection })
  const getCustomExtraCommands: () => ICommand[] = () => [timestamp, referenceLink, codeEdit, codeLive, codePreview, divider, fullscreen]

  const handleSelect = (value: Memo): void => {
    if (resolveSelection != null) resolveSelection(value)
    setIsModalOpen(false)
  }

  return (
    <>
      <MemoBreadcrumb/>
      <MemoTitleInput/>
      {/* editor */}
      <div className="mb-4 flex-grow relative"
           onPaste={(e) => {
             handleImageUpload(e).catch(console.debug)
           }}
      >
        {/* Connection Status - floating bottom right */}
        <div className="absolute bottom-3 right-3 z-10">
          <ConnectionStatusIndicator/>
        </div>
        <RelatedMemoModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
          }}
          recommendations={recommendations}
          onSelect={handleSelect}
        />

        <MDEditor
          value={content}
          commands={[bold, italic, hr, table, comment]}
          extraCommands={getCustomExtraCommands()}
          onChange={(newValue = '') => {
            setContent(newValue)
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
      </div>
    </>
  )
}
