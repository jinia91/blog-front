'use client'
import React from 'react'
import { useAtom } from 'jotai/index'
import { terminalAtom } from '../../usecase/terminal-atom'
import { COMMAND_LINE_DEFAULT } from '../../domain/terminal-context'

interface ViewportProps {
  username: string
}

export default function Viewport (
  { username }: ViewportProps
): React.ReactElement<ViewportProps> {
  const [context] = useAtom(terminalAtom)

  return (
    <div className="viewport overflow-y-auto">
      {context.view.map((line, index) => {
        const isUsernameLine = line.startsWith(username + COMMAND_LINE_DEFAULT)
        return (
          <pre key={index} className="whitespace-pre-wrap">
          {isUsernameLine
            ? (
              <>
                <span className="text-blue-400">{username}</span>
                <span
                  className="text-green-400">{line.replace(username + COMMAND_LINE_DEFAULT, COMMAND_LINE_DEFAULT)}</span>
              </>
              )
            : (<span className="text-green-400">{line}</span>)}
        </pre>
        )
      })}
    </div>
  )
}
