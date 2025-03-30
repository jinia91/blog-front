import React from 'react'

export const ThumbnailInput = ({
  thumbnail,
  setThumbnail,
  uploadThumbnail
}: {
  thumbnail: string
  setThumbnail: (value: string) => void
  uploadThumbnail: (file: File) => Promise<void>
}): React.ReactElement => {
  return (
    <div className="mt-4 mb-4 flex items-center space-x-4 flex-grow w-full">
      <label
        htmlFor="file-upload"
        className="w-1/5 px-4 py-2 font-mono text-sm bg-gray-800 text-green-400 border border-green-400 rounded shadow-lg transition-all hover:bg-green-600 hover:text-gray-200"
      >
        📂 썸네일 파일 선택
      </label>
      <input
        id="file-upload"
        type="file"
        accept="image/*"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file != null) {
            void uploadThumbnail(file)
          }
        }}
        className="hidden"
      />
      <input
        type="text"
        value={thumbnail}
        onChange={(e) => {
          setThumbnail(e.target.value)
        }}
        placeholder="썸네일 URL 입력"
        className="flex p-2 w-full border border-green-500 bg-black text-green-400 placeholder-green-500 rounded w-5/6 focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  )
}
