import React from 'react'

export default function ForbiddenPage (): React.ReactElement {
  return (
    <div className={'flex items-center justify-center pb-20 pt-20'}>
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg border-4 border-gray-800"
           style={{ width: '400px' }}>
        <h2 className="retro-font text-xl font-bold mb-4 text-gray-400">
          403 FORBIDDEN
        </h2>
        <p className={'dos-font text-gray-400 p-8'}>이 페이지에 접근할 권한이 없습니다</p>
      </div>
    </div>
  )
}
