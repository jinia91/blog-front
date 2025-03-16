'use client'
import React from 'react'

// eslint-disable-next-line n/handle-callback-err
export default function GlobalError ({
  error,
  reset
}: {
  error: Error
  reset: () => void
}): React.ReactElement {
  return (
    <html>
    <body className="p-4 bg-gray-900 text-gray-300">
    <h2 className="text-2xl font-bold text-red-400">Something went wrong!</h2>
    <p className="mt-2 text-sm">Please try again later or click the button below to reset the state.</p>
    <button
      className="mt-4 px-4 py-2 border border-green-400 text-green-400"
      onClick={() => {
        reset()
      }}
    >
      Try Again
    </button>
    </body>
    </html>
  )
}
