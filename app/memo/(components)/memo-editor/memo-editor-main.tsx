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
import { detectWikiLinkTrigger, insertWikiLink } from './wiki-link-processor'
import { InlineLinkPopup } from './inline-link-popup'

export default function MemoEditorMain ({ pageMemoId }: { pageMemoId: string }): React.ReactElement {
  const { memoEditorSharedContext, setMemoEditorSharedContext } = useMemoSystem()
  const [memo, setMemo] = useState<Memo | null>(null)
  const [content, setContent] = useState<string>(memo?.content ?? '')
  const [recommendations, setRecommendations] = useState<Memo[]>([])
  const [references, setReferences] = useState<ReferenceInfo[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [initialQuery, setInitialQuery] = useState('')
  const [resolveSelection, setResolveSelection] = useState<(value: any) => null>()
  const [wikiLinkState, setWikiLinkState] = useState<{
    isOpen: boolean
    searchText: string
    startPosition: number
    endPosition: number
    popupPosition: { top: number, left: number }
  }>({
    isOpen: false,
    searchText: '',
    startPosition: -1,
    endPosition: -1,
    popupPosition: { top: 0, left: 0 }
  })
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

  const openModalWithSelection = async (query?: string): Promise<unknown> => {
    setInitialQuery(query ?? '')
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

  const handleModalClose = (): void => {
    if (resolveSelection != null) resolveSelection(null)
    setIsModalOpen(false)
  }

  const handleWikiLinkSelect = (selectedMemo: Memo): void => {
    // Get fresh cursor position at selection time
    const textarea = document.querySelector<HTMLTextAreaElement>('.w-md-editor-text-input')
    if (textarea != null) {
      const cursorPosition = textarea.selectionStart
      const trigger = detectWikiLinkTrigger(content, cursorPosition)
      if (trigger.triggered) {
        const newContent = insertWikiLink(
          content,
          trigger.startPosition,
          trigger.endPosition,
          selectedMemo.memoId.toString(),
          selectedMemo.title
        )
        setContent(newContent)
      }
    }
    setWikiLinkState(prev => ({ ...prev, isOpen: false }))
  }

  const handleWikiLinkClose = (): void => {
    setWikiLinkState(prev => ({ ...prev, isOpen: false }))
  }

  const checkWikiLinkTrigger = (text: string, cursorPosition: number): void => {
    const trigger = detectWikiLinkTrigger(text, cursorPosition)
    if (trigger.triggered) {
      // Get cursor position from textarea for popup placement
      const textarea = document.querySelector<HTMLTextAreaElement>('.w-md-editor-text-input')
      if (textarea != null) {
        const rect = textarea.getBoundingClientRect()
        // Approximate position (could be improved with more precise calculation)
        const lineHeight = 20
        const lines = text.substring(0, cursorPosition).split('\n')
        const currentLine = lines.length
        const top = rect.top + (currentLine * lineHeight) + 30
        const left = rect.left + 50

        setWikiLinkState({
          isOpen: true,
          searchText: trigger.searchText,
          startPosition: trigger.startPosition,
          endPosition: trigger.endPosition,
          popupPosition: { top: Math.min(top, window.innerHeight - 200), left: Math.min(left, window.innerWidth - 300) }
        })
      }
    } else {
      if (wikiLinkState.isOpen) {
        setWikiLinkState(prev => ({ ...prev, isOpen: false }))
      }
    }
  }

  const [isDragOver, setIsDragOver] = useState(false)

  const handleEditorDrop = (e: React.DragEvent): void => {
    e.preventDefault()
    setIsDragOver(false)

    const memoLinkData = e.dataTransfer.getData('application/memo-link')
    if (memoLinkData !== '') {
      try {
        const { id, title } = JSON.parse(memoLinkData)
        // Don't allow linking to self
        if (id.toString() === pageMemoId) return

        const linkText = `[[${title !== '' ? title : 'Untitled'}]]<!-- reference: ${id} -->`
        setContent(prev => prev + '\n' + linkText)
      } catch (error) {
        console.debug('Error parsing memo link data:', error)
      }
    }
  }

  const handleEditorDragOver = (e: React.DragEvent): void => {
    e.preventDefault()
    if (e.dataTransfer.types.includes('application/memo-link')) {
      setIsDragOver(true)
    }
  }

  const handleEditorDragLeave = (e: React.DragEvent): void => {
    e.preventDefault()
    setIsDragOver(false)
  }

  return (
    <div className="flex flex-col h-full">
      <MemoBreadcrumb/>
      <MemoTitleInput/>
      {/* editor */}
      <div
        className={`flex-1 min-h-0 relative ${isDragOver ? 'ring-2 ring-green-400 ring-opacity-50' : ''}`}
        onPaste={(e) => {
          handleImageUpload(e).catch(console.debug)
        }}
        onDrop={handleEditorDrop}
        onDragOver={handleEditorDragOver}
        onDragLeave={handleEditorDragLeave}
      >
        {/* Connection Status - floating bottom right */}
        <div className="absolute bottom-3 right-3 z-10">
          <ConnectionStatusIndicator/>
        </div>

        {/* Drop zone indicator */}
        {isDragOver && (
          <div className="absolute inset-0 bg-green-400 bg-opacity-10 z-20 flex items-center justify-center pointer-events-none">
            <div className="bg-gray-800 text-green-400 px-4 py-2 rounded border border-green-400">
              여기에 놓으면 링크가 생성됩니다
            </div>
          </div>
        )}
        <RelatedMemoModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          recommendations={recommendations}
          onSelect={handleSelect}
          initialQuery={initialQuery}
          currentMemoId={pageMemoId}
          setRecommendations={setRecommendations}
        />

        <MDEditor
          value={content}
          commands={[bold, italic, hr, table, comment]}
          extraCommands={getCustomExtraCommands()}
          onChange={(newValue = '') => {
            setContent(newValue)
            // Check for wiki link trigger
            const textarea = document.querySelector<HTMLTextAreaElement>('.w-md-editor-text-input')
            if (textarea != null) {
              const cursorPosition = textarea.selectionStart
              checkWikiLinkTrigger(newValue, cursorPosition)
            }
          }}
          visibleDragbar={true}
          height="100%"
          className={'border-2 h-full'}
          previewOptions={{
            components: {
              code: Code
            }
          }}
        />

        {/* Wiki Link Inline Popup */}
        <InlineLinkPopup
          isOpen={wikiLinkState.isOpen}
          searchText={wikiLinkState.searchText}
          currentMemoId={pageMemoId}
          onSelect={handleWikiLinkSelect}
          onClose={handleWikiLinkClose}
          position={wikiLinkState.popupPosition}
        />
      </div>
    </div>
  )
}
