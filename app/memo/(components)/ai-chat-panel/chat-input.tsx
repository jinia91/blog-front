'use client'
import React, { useState, useRef, useEffect } from 'react'

interface ChatInputProps {
  onSend: (message: string) => void
  onCommand?: (command: string) => void
  disabled?: boolean
}

export default function ChatInput ({ onSend, onCommand, disabled }: ChatInputProps): React.ReactElement {
  const [input, setInput] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = (): void => {
    const trimmed = input.trim()
    if (trimmed === '' || disabled === true) return

    if (trimmed.startsWith('/') && onCommand !== undefined) {
      onCommand(trimmed)
    } else {
      onSend(trimmed)
    }
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="border-t border-green-400/50 bg-black/90 px-4 py-3 dos-font">
      <div className="flex items-center">
        <span className="text-cyan-400">user@brain</span>
        <span className="text-white">:</span>
        <span className="text-blue-400">~</span>
        <span className="text-white">$ </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value) }}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => { setIsComposing(true) }}
          onCompositionEnd={() => { setIsComposing(false) }}
          disabled={disabled}
          className="flex-1 bg-transparent border-none outline-none text-gray-200 ml-1 caret-green-400"
          placeholder=""
          autoComplete="off"
          spellCheck={false}
        />
      </div>
    </div>
  )
}
