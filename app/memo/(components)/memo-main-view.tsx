'use client'

import React, { useState, useEffect } from 'react'
import MemoGraph from './memo-graph/memo-graph'
import AiChatView from './ai-chat-panel/ai-chat-view'
import { useMemoSystem } from '../(usecase)/memo-system-usecases'

const VIEW_MODE_KEY = 'memo-view-mode'
type ViewMode = 'chat' | 'graph'

export default function MemoMainView (): React.ReactElement {
  const [viewMode, setViewMode] = useState<ViewMode>('chat')
  const { setMemoEditorSharedContext } = useMemoSystem()

  useEffect(() => {
    setMemoEditorSharedContext({ title: '', id: '' })
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem(VIEW_MODE_KEY)
    if (stored === 'chat' || stored === 'graph') {
      setViewMode(stored)
    }
  }, [])

  const toggleView = (): void => {
    const newMode = viewMode === 'chat' ? 'graph' : 'chat'
    setViewMode(newMode)
    localStorage.setItem(VIEW_MODE_KEY, newMode)
  }

  return (
    <div className="w-full h-full">
      {viewMode === 'chat'
        ? (
          <AiChatView onToggleView={toggleView} />
          )
        : (
          <MemoGraph onToggleView={toggleView} />
          )}
    </div>
  )
}
